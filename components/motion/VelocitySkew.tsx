"use client";

import React from "react";

interface VelocitySkewProps {
  children: React.ReactNode;
  className?: string;
  maxSkew?: number;
}

export const VelocitySkew: React.FC<VelocitySkewProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
