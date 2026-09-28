import { Table } from 'semantic-ui-react';
import { ArrayItem, describeValue } from './array-item';

export const ArrayItemsTable: React.FC<{ items: ArrayItem[] }> = ({
  items,
}) => (
  <Table compact celled size="small">
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>itemId</Table.HeaderCell>
        <Table.HeaderCell>id</Table.HeaderCell>
        <Table.HeaderCell>value</Table.HeaderCell>
        <Table.HeaderCell>sortString</Table.HeaderCell>
        <Table.HeaderCell>sortNumber</Table.HeaderCell>
        <Table.HeaderCell>sortDate</Table.HeaderCell>
        <Table.HeaderCell>dateModified</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {items.length === 0 ? (
        <Table.Row>
          <Table.Cell colSpan={7}>No items.</Table.Cell>
        </Table.Row>
      ) : (
        items.map((item) => (
          <Table.Row key={item.id}>
            <Table.Cell>{item.itemId ?? <i>null</i>}</Table.Cell>
            <Table.Cell>{item.id}</Table.Cell>
            <Table.Cell>{describeValue(item.value)}</Table.Cell>
            <Table.Cell>{item.sortString}</Table.Cell>
            <Table.Cell>{item.sortNumber}</Table.Cell>
            <Table.Cell>{item.sortDate}</Table.Cell>
            <Table.Cell>{item.dateModified}</Table.Cell>
          </Table.Row>
        ))
      )}
    </Table.Body>
  </Table>
);
