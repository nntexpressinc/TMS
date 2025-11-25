import React from "react";
import "./PulseDotsLoader.css";

const PulseDotsLoader = ({ size = "md", className = "", ariaLabel = "Loading" }) => {
  const classes = ["pulse-loader", `pulse-loader--${size}`];
  if (className) classes.push(className);

  return (
    <div className={classes.join(" ")} role="status" aria-live="polite" aria-label={ariaLabel}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export const PageLoader = ({ label = "Loading...", minHeight }) => (
  <div className="page-loader" style={minHeight ? { minHeight } : undefined}>
    <PulseDotsLoader size="lg" />
    {label && <p className="page-loader__label">{label}</p>}
  </div>
);

export const OverlayLoader = ({
  label = "Loading",
  subtitle = "",
  fullScreen = true,
  className = "",
  style,
  showText = true,
}) => {
  const classes = [
    "pulse-loader-overlay",
    fullScreen ? null : "pulse-loader-overlay--inline",
    className,
  ].filter(Boolean);
  const ariaLabelText = label || "Loading";

  return (
    <div className={classes.join(" ")} style={style}>
      <PulseDotsLoader size="lg" ariaLabel={ariaLabelText} />
      {showText && label && <p className="pulse-loader-overlay__label">{label}</p>}
      {showText && subtitle && <p className="pulse-loader-overlay__subtitle">{subtitle}</p>}
    </div>
  );
};

export default PulseDotsLoader;
