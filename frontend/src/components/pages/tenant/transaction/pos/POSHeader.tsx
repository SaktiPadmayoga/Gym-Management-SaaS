// File: src/components/pos/POSHeader.tsx
"use client";

import { Icon } from "@/components/icon";

interface POSHeaderProps {
    sessionId: string;
    counter: string;
    branch: string;
    onDestroySession: () => void;
}

export const POSHeader: React.FC<POSHeaderProps> = ({ sessionId, counter, branch, onDestroySession }) => {
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Session:</span>
                        <span className="font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded">{sessionId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded font-medium">{counter}</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded font-medium flex items-center gap-2">
                            <Icon name="plus" className="h-4 w-4" />
                            {branch}
                        </span>
                    </div>
                    <button onClick={onDestroySession} className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1">
                        <Icon name="trash" className="h-4 w-4" />
                        Destroy Session
                    </button>
                </div>
            </div>
        </div>
    );
};
