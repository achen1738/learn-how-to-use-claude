import math
import threading
from abc import ABC, abstractmethod
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import time


@dataclass
class Config:
    algorithm_type: str
    endpoint: str
    params: dict


@dataclass
class RateLimiterResponse:
    allowed: bool
    retry_after_ms: int | None = None

class Algorithm(ABC):

    endpoint: str

    @abstractmethod
    def make_request(self, client_id: str) -> RateLimiterResponse:
        ...


@dataclass(eq=False)
class TokenState:
    tokens_available: int
    last_refill: float | None = None
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False, repr=False)

    def make_request(self, refill_rate_per_second: int, capacity: int) -> RateLimiterResponse:
        with self._lock:
            now = time.monotonic()

            if self.last_refill is None:
                self.last_refill = now
            else:
                elapsed = now - self.last_refill
                tokens_to_add = int(elapsed * refill_rate_per_second)

                if tokens_to_add > 0:
                    self.tokens_available = min(capacity, self.tokens_available + tokens_to_add)
                    # Move forward only by the time those whole tokens represent,
                    # so leftover partial progress carries over to the next request.
                    self.last_refill += tokens_to_add / refill_rate_per_second

                if self.tokens_available >= capacity:
                    # A full bucket can't store extra progress.
                    self.last_refill = now

            if self.tokens_available >= 1:
                self.tokens_available -= 1
                return RateLimiterResponse(allowed=True)

            retry_after_ms = math.ceil((self.last_refill + 1 / refill_rate_per_second - now) * 1000) # offset by num of concurrent requests that failed

            return RateLimiterResponse(allowed=False, retry_after_ms=retry_after_ms)


@dataclass(eq=False)
class TokenBucket(Algorithm):
    capacity: int
    refill_rate_per_second: int
    limits: dict[str, TokenState] = field(default_factory=dict, init=False, repr=False)
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False, repr=False)

    def make_request(self, client_id) -> RateLimiterResponse:
        # Step 1: hold the algorithm lock only to find or create this client's state.
        with self._lock:
            token_state = self.limits.get(client_id)
            if token_state is None:
                token_state = TokenState(tokens_available=self.capacity)
                self.limits[client_id] = token_state

        # Step 2: the algorithm lock is released here. TokenState takes its own lock.
        return token_state.make_request(self.refill_rate_per_second, self.capacity)
      


@dataclass(eq=False)
class SlidingWindowState:
    window: deque = field(default_factory=deque, init=False, repr=False)
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False, repr=False)

    def make_request(self, window_range: int, capacity: int) -> RateLimiterResponse:
        with self._lock:
            now = time.monotonic()
            curr_range = now - window_range

            while self.window and self.window[0] < curr_range:
                self.window.popleft()

            if len(self.window) >= capacity:
                retry_after_ms = math.ceil((self.window[0] - (now - window_range)) * 1000)
                return RateLimiterResponse(allowed=False, retry_after_ms=retry_after_ms)


            self.window.append(now)
            return RateLimiterResponse(allowed=True)


@dataclass(eq=False)
class SlidingWindow(Algorithm):
    capacity: int
    window_seconds: int
    limits: dict[str, SlidingWindowState] = field(default_factory=dict, init=False, repr=False)
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False, repr=False)

    def make_request(self, client_id) -> RateLimiterResponse:
        with self._lock:
            window_state = self.limits.get(client_id)
            if window_state == None:
                window_state = SlidingWindowState()
                self.limits[client_id] = window_state

        return window_state.make_request(self.window_seconds, self.capacity)

class AlgorithmFactory:
    _registry: dict[str, type[Algorithm]] = {
        "sliding_window": SlidingWindow,
        "token_bucket": TokenBucket
    }

    @classmethod
    def create(cls, config: Config) -> Algorithm:
        algorithm_cls = cls._registry.get(config.algorithm_type)
        if algorithm_cls is None:
            raise ValueError("Unknown algorithm type")
        try:
            return algorithm_cls(**config.params)
        except TypeError as e:
            raise ValueError(f"Invalid params for {config.algorith_type}")


@dataclass(eq=False)
class RateLimiter:
    endpoints: dict[str, Algorithm]
    _default_algorithm: Algorithm

    def make_request(self, client_id: str, endpoint: str) -> RateLimiterResponse:
        algorithm = self.endpoints.get(endpoint)
        if algorithm is None:
            return self._default_algorithm.make_request(client_id)

        return algorithm.make_request(client_id)

