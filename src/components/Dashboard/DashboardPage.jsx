import React, { useEffect, useState } from "react";
import { 
  Typography, 
  Box, 
  Grid,
  Paper,
  IconButton,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import { ApiService } from "../../api/auth";
import { useNavigate } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  LocalShipping,
  Person,
  Business,
  DirectionsCar,
  Group,
  Timeline,
  ArrowForward,
  TrendingUp,
  CalendarMonth
} from '@mui/icons-material';

window.isNumber = window.isNumber || ((value) => typeof value === 'number' && !isNaN(value));

const formatLoadStatusData = (loadStatuses) => {
  return [
    { name: 'COVERED', value: Number(loadStatuses.COVERED) || 0, color: '#10B981' },
    { name: 'DELIVERED', value: Number(loadStatuses.DELIVERED) || 0, color: '#6366F1' },
    { name: 'PICKED UP', value: Number(loadStatuses.PICKED_UP) || 0, color: '#F59E0B' },
    { name: 'POSTED', value: Number(loadStatuses.POSTED) || 0, color: '#3B82F6' },
    { name: 'CANCELLED', value: Number(loadStatuses.CANCELLED) || 0, color: '#EF4444' }
  ];
};

const formatDriverPerformanceData = (driverPerformance) => {
  return Object.values(driverPerformance)
    .map(driver => ({
      ...driver,
      totalLoads: Number(driver.totalLoads) || 0,
      completedLoads: Number(driver.completedLoads) || 0,
      cancelledLoads: Number(driver.cancelledLoads) || 0,
      totalMiles: Number(driver.totalMiles) || 0,
      totalRevenue: Number(driver.totalRevenue) || 0,
      efficiency: Number(driver.efficiency) || 0
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5);
};

const formatTopBrokersData = (topBrokers) => {
  return Object.values(topBrokers)
    .map(broker => ({
      ...broker,
      totalLoads: Number(broker.totalLoads) || 0,
      activeLoads: Number(broker.activeLoads) || 0,
      completedLoads: Number(broker.completedLoads) || 0,
      revenue: Number(broker.revenue) || 0,
      averageRate: Number(broker.averageRate) || 0
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState({
    loads: { total: 0, active: 0 },
    dispatchers: { total: 0, active: 0 },
    drivers: { total: 0, active: 0 },
    trucks: { total: 0, active: 0 },
    trailers: { total: 0, active: 0 },
    brokers: { total: 0, active: 0 }
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loadStatusData, setLoadStatusData] = useState([]);
  const [loadTrendData, setLoadTrendData] = useState([]);
  const [driverPerformanceData, setDriverPerformanceData] = useState([]);
  const [topBrokersData, setTopBrokersData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Remove API calls and use static data
    setStats({
      loads: { total: 150, active: 45, revenue: 125000, averageRate: 2.5 },
      dispatchers: { total: 12, active: 8 },
      drivers: { total: 25, active: 18, efficiency: 85 },
      trucks: { total: 30, active: 22, utilization: 75 },
      trailers: { total: 35, active: 28, utilization: 80 },
      brokers: { total: 50, active: 35, topPerformer: "ABC Logistics" }
    });

    setLoadStatusData([
      { name: 'COVERED', value: 45, color: '#10B981' },
      { name: 'DELIVERED', value: 60, color: '#6366F1' },
      { name: 'PICKED UP', value: 25, color: '#F59E0B' },
      { name: 'POSTED', value: 15, color: '#3B82F6' },
      { name: 'CANCELLED', value: 5, color: '#EF4444' }
    ]);

    setLoadTrendData([
      { date: '2024-01-01', total: 10, active: 5, delivered: 3, cancelled: 1, revenue: 8500 },
      { date: '2024-01-02', total: 12, active: 6, delivered: 4, cancelled: 0, revenue: 10200 },
      { date: '2024-01-03', total: 8, active: 4, delivered: 2, cancelled: 1, revenue: 6800 },
      { date: '2024-01-04', total: 15, active: 7, delivered: 5, cancelled: 0, revenue: 12750 },
      { date: '2024-01-05', total: 11, active: 5, delivered: 4, cancelled: 1, revenue: 9350 },
      { date: '2024-01-06', total: 9, active: 4, delivered: 3, cancelled: 0, revenue: 7650 },
      { date: '2024-01-07', total: 13, active: 6, delivered: 5, cancelled: 1, revenue: 11050 }
    ]);

    setDriverPerformanceData([
      { name: 'John Smith', totalLoads: 25, completedLoads: 22, cancelledLoads: 2, totalMiles: 12500, totalRevenue: 31250, efficiency: 88 },
      { name: 'Mike Johnson', totalLoads: 20, completedLoads: 18, cancelledLoads: 1, totalMiles: 10000, totalRevenue: 25000, efficiency: 90 },
      { name: 'Sarah Williams', totalLoads: 18, completedLoads: 16, cancelledLoads: 1, totalMiles: 9000, totalRevenue: 22500, efficiency: 89 },
      { name: 'David Brown', totalLoads: 22, completedLoads: 19, cancelledLoads: 2, totalMiles: 11000, totalRevenue: 27500, efficiency: 86 },
      { name: 'Emily Davis', totalLoads: 15, completedLoads: 14, cancelledLoads: 0, totalMiles: 7500, totalRevenue: 18750, efficiency: 93 }
    ]);

    setTopBrokersData([
      { name: 'ABC Logistics', totalLoads: 35, activeLoads: 12, completedLoads: 20, revenue: 87500, averageRate: 2.5 },
      { name: 'XYZ Transport', totalLoads: 30, activeLoads: 10, completedLoads: 18, revenue: 75000, averageRate: 2.5 },
      { name: 'Global Shipping', totalLoads: 25, activeLoads: 8, completedLoads: 15, revenue: 62500, averageRate: 2.5 },
      { name: 'Fast Freight', totalLoads: 20, activeLoads: 6, completedLoads: 12, revenue: 50000, averageRate: 2.5 },
      { name: 'Premium Logistics', totalLoads: 15, activeLoads: 5, completedLoads: 9, revenue: 37500, averageRate: 2.5 }
    ]);

    setLoading(false);
  }, [timeRange]);

  const StatCard = ({ title, total, active, icon, color, onClick }) => {
    // Safely format numbers
    const formatNumber = (num) => {
      if (typeof num !== 'number' && typeof num !== 'string') return '0';
      const number = Number(num);
      if (isNaN(number)) return '0';
      return number.toLocaleString();
    };

    const activePercentage = total > 0 ? Math.round((active/total) * 100) : 0;

    return (
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: 'background.paper',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 12px -1px rgba(0, 0, 0, 0.15)'
          }
        }}
        onClick={onClick}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <IconButton sx={{ bgcolor: `${color}15`, color: color }}>
            {icon}
          </IconButton>
          <ArrowForward sx={{ color: 'text.secondary' }} />
        </Box>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          {formatNumber(total)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
            <Typography variant="body2" color="text.primary">
              {formatNumber(active)} ({activePercentage}%)
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={activePercentage}
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: `${color}15`,
              '& .MuiLinearProgress-bar': {
                bgcolor: color
              }
            }} 
          />
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F3F4F6', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Dashboard Overview
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
            startAdornment={
              <CalendarMonth sx={{ color: 'text.secondary', mr: 1 }} />
            }
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Loads"
            total={stats.loads.total}
            active={stats.loads.active}
            icon={<LocalShipping />}
            color="#6366F1"
            onClick={() => navigate('/loads')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Dispatchers"
            total={stats.dispatchers.total}
            active={stats.dispatchers.active}
            icon={<Person />}
            color="#10B981"
            onClick={() => navigate('/dispatcher')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Drivers"
            total={stats.drivers.total}
            active={stats.drivers.active}
            icon={<DirectionsCar />}
            color="#F59E0B"
            onClick={() => navigate('/driver')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Trucks"
            total={stats.trucks.total}
            active={stats.trucks.active}
            icon={<LocalShipping />}
            color="#3B82F6"
            onClick={() => navigate('/truck_trailer')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Trailers"
            total={stats.trailers.total}
            active={stats.trailers.active}
            icon={<LocalShipping />}
            color="#8B5CF6"
            onClick={() => navigate('/truck_trailer')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Brokers"
            total={stats.brokers.total}
            active={stats.brokers.active}
            icon={<Business />}
            color="#EC4899"
            onClick={() => navigate('/customer_broker')}
          />
        </Grid>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Load Trend Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: 4, height: '400px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Load Trend Analysis
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<TrendingUp />}
                  sx={{ borderRadius: 2 }}
                >
                  View Details
                </Button>
              </Box>
              <Box sx={{ height: 'calc(100% - 60px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={loadTrendData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#6366F1" 
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                      name="Total Loads"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="active" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorActive)" 
                      name="Active Loads"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="delivered" 
                      stroke="#F59E0B" 
                      fillOpacity={1} 
                      fill="url(#colorDelivered)" 
                      name="Delivered"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Load Status Chart */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 4, height: '400px' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Load Status Distribution
              </Typography>
              <Box sx={{ 
                height: 'calc(100% - 60px)', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between' 
              }}>
                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={loadStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {loadStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} loads`, name]}
                        contentStyle={{ 
                          backgroundColor: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap', 
                  justifyContent: 'center',
                  mt: 2
                }}>
                  {loadStatusData.map((status) => (
                    <Chip
                      key={status.name}
                      label={`${status.name}: ${status.value}`}
                      sx={{
                        bgcolor: `${status.color}15`,
                        color: status.color,
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Driver Performance Chart */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3, borderRadius: 4, height: '400px' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Driver Performance
              </Typography>
              <Box sx={{ height: 'calc(100% - 60px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={driverPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="completedLoads" name="Completed" fill="#10B981" />
                    <Bar dataKey="cancelledLoads" name="Cancelled" fill="#EF4444" />
                    <Bar dataKey="efficiency" name="Efficiency" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Top Brokers Chart */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3, borderRadius: 4, height: '400px' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Top Brokers by Revenue
              </Typography>
              <Box sx={{ height: 'calc(100% - 60px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={topBrokersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => `$${value.toLocaleString()}`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#EC4899" 
                      strokeWidth={2}
                      dot={{ fill: '#EC4899', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;