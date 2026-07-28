import PropTypes from "prop-types";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const DEFAULT_COLORS = ["#2563eb", "#38bdf8", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

function DonutBreakdownChart({ data, dataKey = "value", nameKey = "label", colors = DEFAULT_COLORS }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={62} outerRadius={96}>
          {data.map((entry, index) => (
            <Cell key={`${entry[nameKey]}-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

DonutBreakdownChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataKey: PropTypes.string,
  nameKey: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string)
};

export default DonutBreakdownChart;
