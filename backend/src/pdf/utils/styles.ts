import { StyleDictionary } from 'pdfmake/interfaces';

export const pdfStyles: StyleDictionary = {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 10] as [number, number, number, number],
  },
  subheader: {
    fontSize: 14,
    bold: true,
    margin: [0, 10, 0, 5] as [number, number, number, number],
  },
  sectionTitle: {
    fontSize: 12,
    bold: true,
    margin: [0, 5, 0, 3] as [number, number, number, number],
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    margin: [0, 2, 0, 1] as [number, number, number, number],
  },
  value: {
    fontSize: 10,
    margin: [0, 1, 0, 5] as [number, number, number, number],
  },
  alert: {
    fontSize: 10,
    bold: true,
    color: '#dc2626',
    margin: [3, 2, 3, 2] as [number, number, number, number],
    alignment: 'left',
  },
  tableHeader: {
    fontSize: 10,
    bold: true,
    fillColor: '#f1f5f9',
    margin: [3, 2, 3, 2] as [number, number, number, number],
  },
  tableCell: {
    fontSize: 10,
    margin: [3, 2, 3, 2] as [number, number, number, number],
    alignment: 'left',
  },
  tableCellCenter: {
    fontSize: 10,
    margin: [3, 2, 3, 2] as [number, number, number, number],
    alignment: 'center',
  },
  declaration: {
    fontSize: 9,
    margin: [0, 10, 0, 5] as [number, number, number, number],
    italics: true,
  },
  remarks: {
    fontSize: 10,
    margin: [0, 5, 0, 5] as [number, number, number, number],
  },
};
