import type { TicketPriority, TicketStatus } from '../api/types';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants';
import { Select } from './ui/Select';
import { TextInput } from './ui/TextInput';

interface TicketToolbarProps {
  search: string;
  status: TicketStatus | '';
  priority: TicketPriority | '';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TicketStatus | '') => void;
  onPriorityChange: (value: TicketPriority | '') => void;
}

export function TicketToolbar(props: TicketToolbarProps) {
  return (
    <div className="toolbar">
      <TextInput
        label="Search tickets"
        hideLabel
        type="search"
        placeholder="Search by ID, subject or customer"
        value={props.search}
        onChange={props.onSearchChange}
      />
      <Select
        label="Status"
        placeholder="All"
        options={STATUS_OPTIONS}
        value={props.status}
        onChange={props.onStatusChange}
      />
      <Select
        label="Priority"
        placeholder="All"
        options={PRIORITY_OPTIONS}
        value={props.priority}
        onChange={props.onPriorityChange}
      />
    </div>
  );
}
