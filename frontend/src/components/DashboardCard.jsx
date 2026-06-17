const DashboardCard = ({ icon, value, label, change, changeType = 'up', gradient }) => {
  return (
    <div className="stat-card animate-fade-in-up">
      <div
        className="stat-card__icon"
        style={{ background: gradient || 'var(--grad-primary)' }}
      >
        {icon}
      </div>
      <div className="stat-card__value">{value ?? '—'}</div>
      <div className="stat-card__label">{label}</div>
      {change !== undefined && (
        <div className={`stat-card__change ${changeType}`}>
          {changeType === 'up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
