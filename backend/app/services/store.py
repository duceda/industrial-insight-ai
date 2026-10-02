from collections import defaultdict, deque
from typing import Dict, Deque, Any

from ..config import STORE_MAX_PER_MACHINE


class InMemoryStore:
    def __init__(self, max_per_machine: int = STORE_MAX_PER_MACHINE):
        self.max_per_machine = max_per_machine
        self._store: Dict[str, Deque] = defaultdict(lambda: deque(maxlen=self.max_per_machine))

    def add(self, machine_id: str, record: Any) -> None:
        self._store[machine_id].append(record)

    def get_last(self, machine_id: str, n: int = 10):
        return list(self._store[machine_id])[-n:]

    def list_machines(self):
        return list(self._store.keys())
