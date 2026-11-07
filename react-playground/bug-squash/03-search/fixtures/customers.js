// Sample customers shared by the tests and bin/search.js. `amount` is monthly
// recurring revenue in whole dollars.

const customer = (id, name, email, status, plan, amount, country, created, delinquent, tags) => ({
  id,
  name,
  email,
  status,
  subscription: { plan, amount },
  address: { country },
  created,
  delinquent,
  tags,
});

export const customers = [
  customer("cus_001", "Ada Lovelace", "ada@analytical.io", "active", "pro", 99, "GB", "2025-11-02T09:15:00Z", false, ["vip", "beta"]),
  customer("cus_002", "Grace Hopper", "grace@navy.mil", "active", "enterprise", 1200, "US", "2024-06-15T14:00:00Z", false, ["vip"]),
  customer("cus_003", "Alan Turing", "alan@bletchley.uk", "canceled", "pro", 99, "GB", "2025-02-20T11:30:00Z", false, []),
  customer("cus_004", "Katherine Johnson", "kj@nasa.gov", "past_due", "starter", 29, "US", "2026-01-10T16:45:00Z", true, ["beta"]),
  customer("cus_005", "Linus Torvalds", "linus@kernel.org", "active", "free", 0, "FI", "2025-08-30T08:00:00Z", false, []),
  customer("cus_006", "Margaret Hamilton", "margaret@apollo.dev", "trialing", "pro", 99, "US", "2026-03-01T10:20:00Z", false, ["beta"]),
  customer("cus_007", "Dennis Ritchie", "dmr@bell-labs.com", "canceled", "starter", 29, "US", "2023-12-01T12:00:00Z", false, []),
  customer("cus_008", "Barbara Liskov", "liskov@mit.edu", "active", "pro", 149, "US", "2025-05-05T15:10:00Z", false, ["vip"]),
  customer("cus_009", "Tim Berners-Lee", "tim@w3.org", "past_due", "pro", 99, "GB", "2025-10-12T07:55:00Z", true, []),
  customer("cus_010", "Radia Perlman", "radia@stp.net", "active", "starter", 29, "US", "2026-02-14T13:00:00Z", false, ["beta"]),
  customer("cus_011", "Donald Knuth", "knuth@stanford.edu", "active", "enterprise", 900, "US", "2024-01-20T09:00:00Z", false, ["vip"]),
  customer("cus_012", "Hedy Lamarr", "hedy@spread.fm", "trialing", "starter", 29, "AT", "2026-04-02T18:30:00Z", false, []),
  customer("cus_013", "John McCarthy", "jmc@lisp.ai", "canceled", "enterprise", 900, "US", "2022-09-09T09:09:00Z", false, []),
  customer("cus_014", "Frances Allen", "fran@ibm.com", "active", "pro", 99, "US", "2025-12-24T20:00:00Z", false, ["beta"]),
  customer("cus_015", "Edsger Dijkstra", "ewd@utexas.edu", "past_due", "enterprise", 1200, "NL", "2025-03-03T06:00:00Z", true, ["vip"]),
  customer("cus_016", "Sophie Wilson", "sophie@arm.com", "active", "free", 0, "GB", "2026-01-28T11:11:00Z", false, []),
];
