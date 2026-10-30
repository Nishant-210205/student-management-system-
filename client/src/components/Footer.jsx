import React from 'react';
import { IconGithub, IconExternalLink } from './Icons';

export const Footer = () => {
  return (
    <footer className="fb-footer" role="contentinfo">
      <div className="fb-footer-inner">
        <div className="fb-footer-info">
          <strong>CampusConnect</strong>
          <span>• React 18 (Vercel) + Node.js/Express (Render) + MongoDB Atlas M0 + Claude Desktop MCP</span>
        </div>
        <div className="fb-footer-links">
          <a
            href="https://github.com/co2023smniyazi/three-tier-student-management-system"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <IconGithub size={15} />
            <span>GitHub Repository</span>
            <IconExternalLink size={11} />
          </a>
          <span className="footer-dot">•</span>
          <a
            href="https://three-tier-student-management-system.onrender.com/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <span>Live Health Check</span>
            <IconExternalLink size={11} />
          </a>
          <span className="footer-dot">•</span>
          <span className="footer-budget">₹0 / $0 Free-Tier Stack</span>
        </div>
      </div>
    </footer>
  );
};
