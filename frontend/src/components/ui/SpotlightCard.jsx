
const SpotlightCard = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`spotlight-card ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
      {...props}
    >
      <div className="spotlight-content" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};

export default SpotlightCard;
