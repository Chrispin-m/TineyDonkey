import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegUserCircle } from "react-icons/fa";
import PendingOrders from '../Components/PendingOrders';
import DashboardTiles from '../Components/DashboardTiles';
import { url } from "../Constants/url";
import axios from 'axios';

function Dashboard() {
    const readFromLocalStorage = (key) => JSON.parse(localStorage.getItem(key));
    const navigate = useNavigate();
    
    // nigga this is way better state management
    const [scrolling, setScrolling] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        pendingOrders: null,
        deliveredCount: 0,
        lifetimeIncome: 0,
        stockCount: 0,
        stockWorth: 0,
        totalIncome: 0,
        totalExpenses: 0,
        profit: 0
    });
    const [authorized, setAuthorized] = useState(false);
    
    const token = readFromLocalStorage('token');
    const countRef = useRef(0);
    const cashflowCount = useRef(0);

    useEffect(() => {
        const handleScroll = () => setScrolling(window.scrollY > 0);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // sijui auth so as is pia data fetching
    useEffect(() => {
        if (countRef.current > 0) return;
        countRef.current++;
        
        const fetchData = async () => {
            try {
                const authResponse = await axios.get(`${url}/authentication`, {
                    headers: { 'Authorization': token }
                });

                if (authResponse.data.message !== 'Access granted') {
                    navigate('/Admin');
                    return;
                }

                const ordersResponse = await axios.get(`${url}/getPendingOrders`);
                const { pendingOrders, stockInfo } = ordersResponse.data;

                const deliveredOrders = pendingOrders.filter(o => o.orderStatus === "delivered");
                const deliveredCount = deliveredOrders.reduce((sum, order) => sum + order.products.length, 0);
                const lifetimeIncome = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

                setDashboardData(prev => ({
                    ...prev,
                    pendingOrders: pendingOrders.filter(o => o.orderStatus === "pending"),
                    deliveredCount,
                    lifetimeIncome,
                    stockCount: stockInfo.totalProductsInStock,
                    stockWorth: stockInfo.totalRemainingStockWorth
                }));
                
                setAuthorized(true);
            } catch (error) {
                console.error("Data fetch error:", error);
                navigate('/Admin');
            }
        };

        fetchData();
    }, [token, navigate]);

    // Cashflow
    useEffect(() => {
        if (cashflowCount.current > 0 || !authorized) return;
        cashflowCount.current++;

        const fetchCashflow = async () => {
            try {
                const response = await axios.get(`${url}/getAllCashflow`);
                const cashflows = response.data.payload;

                const { income, expense } = cashflows.reduce((acc, item) => {
                    item.type === 'Income' ? acc.income += item.amount : acc.expense += item.amount;
                    return acc;
                }, { income: 0, expense: 0 });

                setDashboardData(prev => ({
                    ...prev,
                    totalIncome: income,
                    totalExpenses: expense,
                    profit: income - expense
                }));
            } catch (error) {
                console.error("Cashflow error:", error);
            }
        };

        fetchCashflow();
    }, [authorized]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/Admin');
    };

    return (
        <div className="dashboard-container">
            <nav className={`navbar ${scrolling ? 'scrolled' : ''}`}>
                <div className="navbar-content">
                    <h1 className="brand" onClick={() => navigate('/')}>TinyDonkey</h1>
                    <FaRegUserCircle 
                        className="user-icon"
                        onClick={handleLogout}
                        title="Logout"
                    />
                </div>
            </nav>

            {authorized ? (
                <main className="dashboard-content">
                    <header className="dashboard-header">
                        <h2>Welcome Back, Admin</h2>
                        <p className="subtitle">Here's your business overview</p>
                    </header>

                    <DashboardTiles
                        pendingOrders={dashboardData.pendingOrders?.length || 0}
                        totalSales={dashboardData.deliveredCount}
                        totalAmount={dashboardData.lifetimeIncome}
                        profit={dashboardData.profit}
                        figurinesInStock={dashboardData.stockCount}
                        remainingStockWorth={dashboardData.stockWorth}
                    />

                    <section className="pending-orders-section">
                        <div className="section-header">
                            <h3>Pending Orders</h3>
                            <span className="badge">{dashboardData.pendingOrders?.length || 0}</span>
                        </div>
                        <PendingOrders AllProducts={dashboardData.pendingOrders || []} />
                    </section>
                </main>
            ) : (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Securing your dashboard...</p>
                </div>
            )}

            <style jsx>{`
                .dashboard-container {
                    min-height: 100vh;
                    background: #f8f9fa;
                }

                .navbar {
                    position: fixed;
                    top: 0;
                    width: 100%;
                    background: transparent;
                    transition: all 0.3s ease;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .navbar.scrolled {
                    background: #ffffff;
                }

                .navbar-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .brand {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #2c3e50;
                    cursor: pointer;
                    margin: 0;
                }

                .user-icon {
                    font-size: 1.8rem;
                    color: #6c757d;
                    cursor: pointer;
                    transition: transform 0.2s ease;

                    &:hover {
                        transform: scale(1.1);
                        color: #495057;
                    }
                }

                .dashboard-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 100px 2rem 2rem;
                }

                .dashboard-header {
                    text-align: center;
                    margin-bottom: 3rem;

                    h2 {
                        font-size: 2rem;
                        color: #2c3e50;
                        margin-bottom: 0.5rem;
                    }

                    .subtitle {
                        color: #6c757d;
                        font-size: 1.1rem;
                    }
                }

                .pending-orders-section {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    margin-top: 2rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;

                    h3 {
                        margin: 0;
                        font-size: 1.3rem;
                        color: #343a40;
                    }

                    .badge {
                        background: #e9ecef;
                        color: #495057;
                        padding: 0.25rem 0.75rem;
                        border-radius: 20px;
                        font-size: 0.9rem;
                    }
                }

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    gap: 1.5rem;

                    p {
                        color: #6c757d;
                        font-size: 1.2rem;
                    }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}

export default Dashboard;
