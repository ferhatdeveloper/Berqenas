// src/api/mockTableApi.ts

export type TableRow = Record<string, any>;

let mockTables = [
  {
    name: 'company',
    columns: [
      { name: 'id', type: 'int8' },
      { name: 'name', type: 'text' },
      { name: 'description', type: 'text' },
    ],
    rows: [
      { id: 1, name: 'demo', description: 'test' },
      { id: 2, name: 'test', description: 'örnek' },
    ],
  },
  {
    name: 'company_period',
    columns: [
      { name: 'id', type: 'int8' },
      { name: 'company_id', type: 'int8' },
      { name: 'period', type: 'text' },
    ],
    rows: [
      { id: 1, company_id: 1, period: '2024-Q1' },
    ],
  },
];

export async function getTables() {
  return mockTables.map(t => ({ name: t.name, columns: t.columns }));
}

export async function getRows(tableName: string) {
  const table = mockTables.find(t => t.name === tableName);
  return table ? table.rows : [];
}

export async function addRow(tableName: string, row: TableRow) {
  const table = mockTables.find(t => t.name === tableName);
  if (table) {
    table.rows.push(row);
    return row;
  }
  throw new Error('Table not found');
}

export async function updateRow(tableName: string, rowIndex: number, row: TableRow) {
  const table = mockTables.find(t => t.name === tableName);
  if (table && table.rows[rowIndex]) {
    table.rows[rowIndex] = row;
    return row;
  }
  throw new Error('Row not found');
}

export async function deleteRow(tableName: string, rowIndex: number) {
  const table = mockTables.find(t => t.name === tableName);
  if (table && table.rows[rowIndex]) {
    table.rows.splice(rowIndex, 1);
    return true;
  }
  throw new Error('Row not found');
}