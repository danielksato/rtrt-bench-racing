import React, { useEffect, useState, type FC } from 'react';
import { Rows } from '../const';
import { mapRow, displayNum, headingMap } from '../util/fieldMapping';
import EditableCell from './EditableCell';

const { DRIVER, RAW_TIME, PAX_TIME, PAX_FACTOR, PAX_POS } = Rows;

const SortableTable: FC<{ table: Element }> = ({ table }) => {
  const [sort, setSort] = useState(PAX_TIME);
  const [rows, setRows] = useState(
    [] as { original: number | string; hypothetical: number | string }[][],
  );

  useEffect(() => {
    setRows((rows) => {
      return (
        !rows.length
          ? [...table.querySelectorAll('tr')]
              .map((tr) =>
                [...tr.querySelectorAll('td')].map(
                  ({ textContent }) => textContent as string,
                ),
              )
              .filter((row) => `${row[RAW_TIME]}`.toUpperCase() !== 'DNS')
              .map(mapRow)
              .slice(1)
          : [...rows]
      ).sort((a, b) => (a[sort].hypothetical >= b[sort].hypothetical ? 1 : -1));
    });
  }, [sort, table]);

  const headings = [...table.querySelectorAll('th')].map(
    ({ textContent }) => textContent,
  );

  const createOnChange = (target: number) => (hypothetical: number) => {
    setRows(
      rows
        .reduce(
          (acc, row, i) => {
            if (i !== target) {
              return [...acc, row];
            }
            return [
              ...acc,
              row.reduce(
                (acc, val, j) => {
                  if (j === RAW_TIME) return [...acc, { ...val, hypothetical }];
                  if (j === PAX_TIME)
                    return [
                      ...acc,
                      {
                        ...val,
                        hypothetical:
                          (row[PAX_FACTOR].original as number) * hypothetical,
                      },
                    ];
                  return [...acc, val];
                },
                [] as {
                  original: number | string;
                  hypothetical: number | string;
                }[],
              ),
            ];
          },
          [] as {
            original: number | string;
            hypothetical: number | string;
          }[][],
        )
        .sort((a, b) =>
          a[sort].hypothetical >= b[sort].hypothetical ? 1 : -1,
        ),
    );
  };

  return (
    <table>
      <thead>
        <tr>
          {headings.map((heading, i) => (
            <th key={`heading-${heading}`}>
              <button onClick={() => setSort(i)}>
                {headingMap[`${i as keyof typeof headingMap}`] || heading}
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const name = row[DRIVER].original;
          const position = row[PAX_POS].original;
          return (
            <tr
              key={`data-${name}-${position}`}
              className={
                row[RAW_TIME].hypothetical !== row[RAW_TIME].original
                  ? 'highlighted'
                  : ''
              }
            >
              {row.map(({ original, hypothetical }, i) => {
                const key = `data-${name}-${i}`;
                if (i !== RAW_TIME) {
                  return <td key={key}>{displayNum(hypothetical)}</td>;
                } else {
                  return (
                    <EditableCell
                      key={`${key}-editable`}
                      onChange={createOnChange(index)}
                    >
                      {displayNum(hypothetical) as string}
                    </EditableCell>
                  );
                }
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default SortableTable;
