import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Collapse,
  TextField,
  Stack,
  Button
} from "@mui/material";

// Material UI Icons
import {
  LocalShipping,
  Person,
  DirectionsCar,
  Business,
  TrendingUp,
  CalendarToday,
  Groups
} from "@mui/icons-material";

// Recharts components
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";

// Using TextField with date type instead of MUI DatePicker to avoid dependency conflicts

import { ApiService } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import { getTeamStatistics } from '../../api/statistics';

// StatCard component definition
const StatCard = ({ title, total, active, icon, color, onClick }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 4,
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
      }
    }}
    onClick={onClick}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ color, mr: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" sx={{ color: 'text.primary', mb: 1 }}>
      {total}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Active: {active}
    </Typography>
  </Paper>
);

// Utility functions
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

const formatTeamPerformanceData = (teams) => {
  return teams.map(team => ({
    ...team,
    totalPerMile: Number(team.total_per_mile) || 0,
    averagePerMile: Number(team.average_per_mile) || 0,
    loadCount: Number(team.load_count) || 0,
    performancePercentage: Number(team.performance_percentage) || 0,
    dispatchers: team.dispatchers.map(dispatcher => ({
      ...dispatcher,
      totalPerMile: Number(dispatcher.total_per_mile) || 0,
      averagePerMile: Number(dispatcher.average_per_mile) || 0,
      loadCount: Number(dispatcher.load_count) || 0,
      performancePercentage: Number(dispatcher.performance_percentage) || 0
    }))
  }))
    .sort((a, b) => b.performancePercentage - a.performancePercentage);
};

const getPerformanceColor = (rating) => {
  switch (rating.toLowerCase()) {
    case 'excellent':
      return '#10B981';
    case 'above average':
      return '#3B82F6';
    case 'average':
      return '#F59E0B';
    case 'below average':
      return '#EF4444';
    case 'poor':
      return '#6B7280';
    default:
      return '#6B7280';
  }
};

const DashboardPage = () => {
  // State hooks inside the component
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: firstDay,
      endDate: lastDay
    };
  });
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [teamStats, setTeamStats] = useState({
    globalStats: {
      totalPerMile: 0,
      averagePerMile: 0,
      totalLoads: 0
    },
    teams: []
  });
  const [loadStatusData, setLoadStatusData] = useState([]);
  const [loadTrendData, setLoadTrendData] = useState([]);
  const [driverPerformanceData, setDriverPerformanceData] = useState([]);
  const [topBrokersData, setTopBrokersData] = useState([]);
  const [stats, setStats] = useState({
    loads: { total: 0, active: 0 },
    dispatchers: { total: 0, active: 0 },
    drivers: { total: 0, active: 0 },
    trucks: { total: 0, active: 0 },
    trailers: { total: 0, active: 0 },
    brokers: { total: 0, active: 0 }
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          date_from: format(dateRange.startDate, 'yyyy-MM-dd'),
          date_to: format(dateRange.endDate, 'yyyy-MM-dd')
        };

        const teamStatsData = await getTeamStatistics(params);
        setTeamStats({
          globalStats: {
            totalPerMile: teamStatsData.global_stats.total_per_mile,
            averagePerMile: teamStatsData.global_stats.average_per_mile,
            totalLoads: teamStatsData.global_stats.total_loads
          },
          teams: formatTeamPerformanceData(teamStatsData.teams)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Mock data - replace with actual API calls
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
  }, [dateRange]);

  const formatNumber = (num) => {
    if (typeof num !== 'number' && typeof num !== 'string') return '0';
    const number = Number(num);
    if (isNaN(number)) return '0';
    return number.toLocaleString();
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

  const handleTeamClick = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const CircularPerformance = ({ value, rating }) => {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {/* Background circle */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={60}
          thickness={4}
          sx={{ color: '#E5E7EB' }}
        />
        {/* Foreground progress */}
        <CircularProgress
          variant="determinate"
          value={value}
          size={60}
          thickness={4}
          sx={{
            color: getPerformanceColor(rating),
            position: 'absolute',
            left: 0
          }}
        />
        {/* Percentage text */}
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" sx={{ fontWeight: 'bold' }}>
            {`${Math.round(value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#F3F4F6', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={dateRange.startDate.toISOString().split('T')[0]}
              onChange={(e) => {
                if (e.target.value) {
                  setDateRange(prev => ({ ...prev, startDate: new Date(e.target.value) }));
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={dateRange.endDate.toISOString().split('T')[0]}
              onChange={(e) => {
                if (e.target.value) {
                  setDateRange(prev => ({ ...prev, endDate: new Date(e.target.value) }));
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Global Statistics Cards */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h4" sx={{ color: '#0EA5E9', fontWeight: 'bold', textAlign: 'center' }}>
                ${teamStats.globalStats.totalPerMile.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B7280', textAlign: 'center', mt: 1 }}>
                Total Revenue Per Mile
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h4" sx={{ color: '#10B981', fontWeight: 'bold', textAlign: 'center' }}>
                ${teamStats.globalStats.averagePerMile.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B7280', textAlign: 'center', mt: 1 }}>
                Average Revenue Per Mile
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h4" sx={{ color: '#6366F1', fontWeight: 'bold', textAlign: 'center' }}>
                {teamStats.globalStats.totalLoads.toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B7280', textAlign: 'center', mt: 1 }}>
                Total Loads
              </Typography>
            </Paper>
          </Grid>

          {/* Teams Table Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#F8FAFC' }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#1F2937', fontWeight: 'bold' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Groups sx={{ color: '#6366F1' }} />
                  Team Performance
                </Box>
              </Typography>
              <Box sx={{ width: '100%', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #E5E7EB' }}>Team</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Loads</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Rev/Mile</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #E5E7EB' }}>Performance</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #E5E7EB' }}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamStats.teams.map((team) => (
                      <React.Fragment key={team.team_id}>
                        <tr
                          onClick={() => handleTeamClick(team.team_id)}
                          style={{ 
                            cursor: 'pointer', 
                            backgroundColor: expandedTeam === team.team_id ? '#E5E7EB' : 'transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: '#F1F5F9'
                            }
                          }}
                        >
                          <td style={{ 
                            padding: '16px', 
                            textAlign: 'left', 
                            borderBottom: '1px solid #E5E7EB',
                            fontWeight: 'bold',
                            color: '#1F2937'
                          }}>
                            {team.team_name}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>
                            {team.loadCount.toLocaleString()}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>
                            ${team.averagePerMile.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #E5E7EB' }}>
                            <CircularPerformance value={team.performancePercentage} rating={team.performance_rating} />
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #E5E7EB' }}>
                            <Chip
                              label={team.performance_rating}
                              size="small"
                              sx={{
                                bgcolor: `${getPerformanceColor(team.performance_rating)}15`,
                                color: getPerformanceColor(team.performance_rating),
                                fontWeight: 500
                              }}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="5" style={{ padding: 0 }}>
                            <Collapse in={expandedTeam === team.team_id}>
                              <Box sx={{ 
                                p: 3, 
                                bgcolor: '#EEF2FF',
                                borderLeft: '4px solid #6366F1',
                                margin: '8px 16px',
                                borderRadius: '0 8px 8px 0',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                              }}>
                                <Typography variant="subtitle2" sx={{ 
                                  mb: 2,
                                  color: '#4F46E5',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                  <Person sx={{ fontSize: 20 }} />
                                  Dispatcher Performance
                                </Typography>
                                <table style={{ 
                                  width: '100%', 
                                  borderCollapse: 'collapse',
                                  backgroundColor: 'white',
                                  borderRadius: '8px',
                                  overflow: 'hidden'
                                }}>
                                  <thead>
                                    <tr>
                                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Name</th>
                                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>Loads</th>
                                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>Rev/Mile</th>
                                      <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #E5E7EB' }}>Performance</th>
                                      <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #E5E7EB' }}>Rating</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {team.dispatchers.map((dispatcher) => (
                                      <tr key={dispatcher.id}>
                                        <td style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                                          {dispatcher.dispatcher_name}
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>
                                          {dispatcher.loadCount.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>
                                          ${dispatcher.averagePerMile.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #E5E7EB' }}>
                                          <CircularPerformance value={dispatcher.performancePercentage} rating={dispatcher.performance_rating} />
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #E5E7EB' }}>
                                          <Chip
                                            label={dispatcher.performance_rating}
                                            size="small"
                                            sx={{
                                              bgcolor: `${getPerformanceColor(dispatcher.performance_rating)}15`,
                                              color: getPerformanceColor(dispatcher.performance_rating),
                                              fontWeight: 500
                                            }}
                                          />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </Box>
                            </Collapse>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

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
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
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
                      formatter={(value) => `${value.toLocaleString()}`}
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

          {/* Team Performance Section */}
          
            
          
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;