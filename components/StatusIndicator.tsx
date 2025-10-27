
import React from 'react';
import { Status } from '../types';

interface StatusIndicatorProps {
  status: Status;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case Status.LISTENING:
        return { text: 'Listening...', color: 'bg-blue-500', animate: true };
      case Status.THINKING:
        return { text: 'Thinking...', color: 'bg-yellow-500', animate: true };
      case Status.SPEAKING:
        return { text: 'Speaking...', color: 'bg-green-500', animate: true };
      case Status.ERROR:
        return { text: 'Error', color: 'bg-red-500', animate: false };
      case Status.IDLE:
      default:
        return { text: 'Idle', color: 'bg-gray-500', animate: false };
    }
  };

  const { text, color, animate } = getStatusInfo();

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${color} ${animate ? 'animate-pulse' : ''}`}></div>
      <span className="text-sm font-medium text-gray-300">{text}</span>
    </div>
  );
};

export default StatusIndicator;
