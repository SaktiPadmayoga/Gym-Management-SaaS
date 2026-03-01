import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface RevenueCardProps {
    title: string;
    amount: number;
    currency?: string;
    percentage: number;
    trendText: string;
    subtitle: string;
    isPositive?: boolean;
    className?: string;
}

export const Card: React.FC<RevenueCardProps> = ({ title, amount, currency = "$", percentage, trendText, subtitle, isPositive = true, className = "" }) => {
    const formatAmount = (value: number): string => {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatPercentage = (value: number): string => {
        const sign = value >= 0 ? "+" : "";
        return `${sign}${value}%`;
    };

    return (
        <div className={`bg-white rounded-xl p-6  border border-neutral-200 dark:border-neutral-700 transition-colors duration-200 ${className} py-8`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-neutral-600 dark:text-neutral-300 text-sm font-medium">{title}</h3>
                <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${
                        isPositive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}
                >
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{formatPercentage(percentage)}</span>
                </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
                <span className="text-3xl font-atkin font-semibold text-neutral-900 dark:text-white">
                    {currency}
                    {formatAmount(amount)}
                </span>
            </div>

            {/* Trend Info */}
            <div className="space-y-1">
                <div className="flex items-center space-x-2">
                    <span className="text-neutral-900 dark:text-white text-sm font-medium">{trendText}</span>
                    {isPositive ? <TrendingUp size={16} className="text-neutral-600 dark:text-neutral-400" /> : <TrendingDown size={16} className="text-neutral-600 dark:text-neutral-400" />}
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs">{subtitle}</p>
            </div>
        </div>
    );
};
