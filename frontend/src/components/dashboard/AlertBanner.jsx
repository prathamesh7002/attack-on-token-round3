import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, AlertCircle, AlertOctagon, Info } from 'lucide-react';
import { ALERT_LEVELS } from '../../constants/alertLevels';
import { getAlertLevelTokens } from '../../utils/alerts';
import Button from '../common/Button';

export default function AlertBanner({ budgetStatus }) {
  if (!budgetStatus) return null;

  const { alertLevel, message } = budgetStatus;

  // Don't clutter the screen if spending is completely safe
  if (alertLevel === ALERT_LEVELS.SAFE) {
    return null;
  }

  const tokens = getAlertLevelTokens(alertLevel);

  let Icon = Info;
  if (alertLevel === ALERT_LEVELS.WARNING) Icon = AlertTriangle;
  else if (alertLevel === ALERT_LEVELS.HIGH) Icon = AlertCircle;
  else if (alertLevel === ALERT_LEVELS.EXCEEDED) Icon = AlertOctagon;

  return (
    <div
      role="alert"
      className={`w-full p-4 rounded-xl border ${tokens.borderColor} ${tokens.bgColor} flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 select-none`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={`w-5 h-5 flex-shrink-0 ${tokens.textColor}`} />
        <p className="text-sm font-medium text-text-primary leading-snug">
          {message}
        </p>
      </div>

      {alertLevel === ALERT_LEVELS.NO_BUDGET && (
        <Link to="/budget" className="flex-shrink-0">
          <Button size="sm" variant="secondary" className="h-9 px-3 text-xs">
            Set budget
          </Button>
        </Link>
      )}
    </div>
  );
}
