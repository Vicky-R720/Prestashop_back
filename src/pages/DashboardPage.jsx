function DashboardPage() {

    return (
        <>
            <section className="stats">

                <article className="card">
                    <p className="card__label">Total Revenue</p>
                    <p className="card__value">$128,430</p>
                    <p className="card__trend is-up">+12.6% this month</p>
                </article>
                <article className="card">
                    <p className="card__label">Orders</p>
                    <p className="card__value">2,984</p>
                    <p className="card__trend is-up">+4.2% this week</p>
                </article>
                <article className="card">
                    <p className="card__label">New Customers</p>
                    <p className="card__value">324</p>
                    <p className="card__trend is-up">+9.1% in 7 days</p>
                </article>
                <article className="card">
                    <p className="card__label">Pending Shipments</p>
                    <p className="card__value">38</p>
                    <p className="card__trend">3 need attention</p>
                </article>

            </section>

            <section className="grid">
                <div className="panel">
                    <div className="panel__header">
                        <div>
                            <h2>Recent Orders</h2>
                            <p className="panel__subtitle">Latest activity from your store</p>
                        </div>
                        <button className="panel__action" type="button">View all</button>
                    </div>
                    <div className="table">
                        <div className="table__row table__head">
                            <span>Order</span>
                            <span>Customer</span>
                            <span>Status</span>
                            <span>Amount</span>
                        </div>
                        <div className="table__row">
                            <span>#PS-4821</span>
                            <span>Olivia Lambert</span>
                            <span className="status is-paid">Paid</span>
                            <span>$2,480</span>
                        </div>
                        <div className="table__row">
                            <span>#PS-4816</span>
                            <span>Noah Carter</span>
                            <span className="status is-shipping">Shipping</span>
                            <span>$860</span>
                        </div>
                        <div className="table__row">
                            <span>#PS-4809</span>
                            <span>Sophia Reyes</span>
                            <span className="status is-pending">Pending</span>
                            <span>$320</span>
                        </div>
                        <div className="table__row">
                            <span>#PS-4801</span>
                            <span>Leo Bianchi</span>
                            <span className="status is-paid">Paid</span>
                            <span>$1,190</span>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__header">
                        <div>
                            <h2>Sales Overview</h2>
                            <p className="panel__subtitle">Revenue trend placeholder</p>
                        </div>
                        <button className="panel__action" type="button">Last 30 days</button>
                    </div>
                    <div className="chart">
                        <div className="chart__bars">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <p className="chart__label">Chart placeholder</p>
                    </div>
                </div>
            </section>
        </>
    );
}

export default DashboardPage;