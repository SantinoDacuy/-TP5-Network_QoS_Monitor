import React from 'react';
import { DegradationAlert } from '../../../mobile/src/notifications/NotificationManager';
import { AlertTriangle, AlertCircle, X, Bell } from 'lucide-react';

interface DegradationAlertBannerProps {
  alerts: DegradationAlert[];
  onDismiss: (id: string) => void;
}

export const DegradationAlertBanner: React.FC<DegradationAlertBannerProps> = ({
  alerts,
  onDismiss
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {alerts.slice(0, 2).map((alert) => {
        const isCritical = alert.severity === 'critical';
        const borderColor = isCritical ? 'border-rose-500/50' : 'border-amber-500/50';
        const bgColor = isCritical ? 'bg-rose-950/40' : 'bg-amber-950/40';
        const textColor = isCritical ? 'text-rose-300' : 'text-amber-300';
        const Icon = isCritical ? AlertCircle : AlertTriangle;

        return (
          <div
            key={alert.id}
            className={`flex items-start justify-between p-3.5 rounded-xl border ${borderColor} ${bgColor} backdrop-blur-md animate-fade-in`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${textColor}`} />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>
                    {alert.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-0.5">{alert.message}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">{alert.details}</p>
              </div>
            </div>

            <button
              onClick={() => onDismiss(alert.id)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
              title="Descartar alerta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
