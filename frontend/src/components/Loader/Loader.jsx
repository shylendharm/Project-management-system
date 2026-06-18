const Loader = ({ fullPage = false, text = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>{text}</span>
      </div>
    );
  }
  return (
    <div className="loader-overlay">
      <div className="spinner" />
      <span style={{ fontSize: '0.85rem' }}>{text}</span>
    </div>
  );
};

export default Loader;
