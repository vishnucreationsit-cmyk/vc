import React, { useState, useEffect } from 'react';

const CheckInTokenModal = ({ isOpen, onClose, onSubmit, type }) => {
    const [token, setToken] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setTimeLeft(600);
        setToken('');
        setError(null);

        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    setError('Token has expired. Please request a new one.');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [isOpen]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (token.length !== 6) {
            setError('Please enter a 6-digit token.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await onSubmit(token, type); // Call parent handler
            onClose();
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Security Verification</h2>
                <p className="text-gray-600 mb-6">
                    A 6-digit token has been sent to your email. Please enter it below to confirm your {type === 'CHECK_IN' ? 'check-in' : 'check-out'}.
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        maxLength="6"
                        value={token}
                        onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000000"
                        className="w-full text-center text-4xl tracking-[0.5em] font-mono p-4 border-2 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
                        disabled={timeLeft === 0 || loading}
                    />

                    {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                    <div className="flex justify-between items-center mb-6">
                        <span className={`text-sm font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-gray-500'}`}>
                            Time remaining: {formatTime(timeLeft)}
                        </span>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={timeLeft === 0 || loading || token.length !== 6}
                            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify Token'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckInTokenModal;
