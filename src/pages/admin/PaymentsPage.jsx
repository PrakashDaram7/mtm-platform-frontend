import React from 'react';
import Layout from '../../components/Layout';

const PaymentsPage = () => {
    return (
        <Layout pageTitle="Payments" pageSubtitle="View payment transactions">
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Payment Transactions</div>
                </div>
                <div className="card-body">
                    <div className="empty-state">
                        <div className="empty-state-icon">💳</div>
                        <h3>No Payments Yet</h3>
                        <p>Payment transactions will appear here once the Razorpay payment gateway is integrated.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PaymentsPage;
