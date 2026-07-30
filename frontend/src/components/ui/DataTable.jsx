import PropTypes from "prop-types";

function getAlignClass(align) {
  if (align === "center") return "ui-cell-center";
  if (align === "right") return "ui-cell-right";
  return undefined;
}

function DataTable({ columns, rows, emptyMessage = "No records found." }) {
  if (!rows.length) {
    return <p className="ui-empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={getAlignClass(column.align)}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => (
                <td key={`${row.id || index}-${column.key}`} className={getAlignClass(column.align)}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(["left", "center", "right"])
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  emptyMessage: PropTypes.string
};

export default DataTable;
