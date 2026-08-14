import React from 'react';

interface StepperConnectorProps {
    color?: string;
    active?: boolean;
}

export const StepperConnector: React.FC<StepperConnectorProps> = ({ color, active = false }) => {
    const strokeColor = color || (active ? '#00A050' : '#CBD5E1');
    return (
        <div className="flex-1 mx-2 sm:mx-4 flex items-center mb-4 min-w-[28px]">
            <svg className="w-full h-1 overflow-visible" preserveAspectRatio="none">
                <line
                    x1="2"
                    y1="2"
                    x2="100%"
                    y2="2"
                    stroke={strokeColor}
                    strokeWidth="2"
                    strokeDasharray={active ? "5 7" : "1 14"}
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};
