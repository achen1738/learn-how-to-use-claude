


from dataclasses import dataclass, field
from collections.abc import Callable
from typing import Dict, List, Tuple
from abc import ABC, abstractmethod
import uuid

@dataclass
class Expense:
    expense_id: str
    trip_id: str
    amount_usd: str
    expense_type: str
    vendor_type: str
    vendor_name: str


class Policy(ABC):
    rule_id: str
    policy: Callable
    
    @abstractmethod
    def breaks_policy(self, data):
        pass

class ExpensePolicy(Policy):
    def __init__(self, policy: Callable[[Expense], bool]):
        self.rule_id = uuid.uuid4()
        self.policy = policy
    
    def breaks_policy(self, expense: Expense) -> bool:
        return self.policy(expense)

class TripPolicy(Policy):
    def __init__(self, policy: Callable[[List[Expense]], bool]):
        self.rule_id = uuid.uuid4()
        self.policy = policy
    
    def breaks_policy(self, expenses: List[Expense]) -> bool:
        return self.policy(expenses)

@dataclass
class EvaluationResult:
    expense_violations: List[Tuple[Expense, List[Policy]]] = field(default_factory=list)
    trip_violations: List[Tuple[List[Expense], List[Policy]]] = field(default_factory=list)

class RulesEng:
    def __init__(self):
        self.expense_rules: List[Policy] = []
        self.trip_rules: List[Policy] = []

    def evaluate_rules(self, rules: List[Policy], expenses: List[Expense]) -> EvaluationResult:
        expense_rules = [rule for rule in rules if isinstance(rule, ExpensePolicy)]
        trip_rules = [rule for rule in rules if isinstance(rule, TripPolicy)]

        violations = []
        trips = {}
        for expense in expenses:
            trips.setdefault(expense.trip_id, []).append(expense)
            broken_rules = [rule for rule in expense_rules if rule.breaks_policy(expense)]
            if broken_rules:
                violations.append((expense, broken_rules))

        trip_violations = []
        for trip_expenses in trips.values():
            broken_trip_rules = [rule for rule in trip_rules if rule.breaks_policy(trip_expenses)]
            if broken_trip_rules:
                trip_violations.append((trip_expenses, broken_trip_rules))
        return EvaluationResult(expense_violations=violations, trip_violations=trip_violations)


    def add_expense_rule(self, rule: Callable[[Expense]]):
        self.expense_rules.append(ExpensePolicy(rule))

    def add_trip_rule(self, rule: Callable[[List[Expense]]]):
        self.trip_rules.append(TripPolicy(rule))
