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
    const fetchDashboardData = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          setLoading(true);
          
          // Loads statistics
          const loadsData = await ApiService.getData('/load/');
          const loadStatuses = {
            COVERED: 0,
            DELIVERED: 0,
            PICKED_UP: 0,
            POSTED: 0,
            CANCELLED: 0
          };
          
          // Calculate load statistics
          loadsData.forEach(load => {
            if (loadStatuses.hasOwnProperty(load.load_status)) {
              loadStatuses[load.load_status]++;
            }
          });

          // Calculate revenue and performance metrics
          const revenueMetrics = {
            totalRevenue: 0,
            totalDriverPay: 0,
            totalMiles: 0,
            averageRatePerMile: 0,
            completedLoads: 0
          };

          loadsData.forEach(load => {
            revenueMetrics.totalRevenue += parseFloat(load.load_pay || 0);
            revenueMetrics.totalDriverPay += parseFloat(load.driver_pay || 0);
            revenueMetrics.totalMiles += load.total_miles || 0;
            if (load.load_status === 'DELIVERED') {
              revenueMetrics.completedLoads++;
            }
          });

          revenueMetrics.averageRatePerMile = revenueMetrics.totalMiles > 0 
            ? revenueMetrics.totalRevenue / revenueMetrics.totalMiles 
            : 0;

          // Load trend data
          const loadTrends = {};
          loadsData.forEach(load => {
            const date = new Date(load.created_date).toLocaleDateString();
            if (!loadTrends[date]) {
              loadTrends[date] = {
                date,
                total: 0,
                active: 0,
                delivered: 0,
                cancelled: 0,
                revenue: 0
              };
            }
            loadTrends[date].total++;
            loadTrends[date].revenue += parseFloat(load.load_pay || 0);
            if (['COVERED', 'PICKED_UP'].includes(load.load_status)) {
              loadTrends[date].active++;
            }
            if (load.load_status === 'DELIVERED') {
              loadTrends[date].delivered++;
            }
            if (load.load_status === 'CANCELLED') {
              loadTrends[date].cancelled++;
            }
          });
          
          // Drivers statistics
          const driversData = await ApiService.getData('/driver/');
          const driverStatuses = {
            ACTIVE: 0,
            INACTIVE: 0
          };
          
          driversData.forEach(driver => {
            if (driver.employment_status === 'ACTIVE (DF)') {
              driverStatuses.ACTIVE++;
            } else {
              driverStatuses.INACTIVE++;
            }
          });

          // Driver performance metrics
          const driverPerformance = {};
          driversData.forEach(driver => {
            const driverLoads = loadsData.filter(load => load.driver?.id === driver.id);
            driverPerformance[`${driver.first_name} ${driver.last_name}`] = {
              name: `${driver.first_name} ${driver.last_name}`,
              totalLoads: driverLoads.length,
              completedLoads: driverLoads.filter(load => load.load_status === 'DELIVERED').length,
              cancelledLoads: driverLoads.filter(load => load.load_status === 'CANCELLED').length,
              totalMiles: driverLoads.reduce((sum, load) => sum + (load.total_miles || 0), 0),
              totalRevenue: driverLoads.reduce((sum, load) => sum + parseFloat(load.load_pay || 0), 0),
              efficiency: driverLoads.length > 0 
                ? (driverLoads.filter(load => load.load_status === 'DELIVERED').length / driverLoads.length) * 100 
                : 0
            };
          });
          
          // Trucks and trailers statistics
          const trucksData = await ApiService.getData('/truck/');
          const trailersData = await ApiService.getData('/trailer/');
          
          // Brokers statistics
          const brokersData = await ApiService.getData('/customer_broker/');
          
          // Top brokers analysis
          const topBrokers = {};
          loadsData.forEach(load => {
            if (load.customer_broker) {
              const brokerName = load.customer_broker.company_name;
              if (!topBrokers[brokerName]) {
                topBrokers[brokerName] = {
                  name: brokerName,
                  totalLoads: 0,
                  activeLoads: 0,
                  completedLoads: 0,
                  revenue: 0,
                  averageRate: 0
                };
              }
              topBrokers[brokerName].totalLoads++;
              if (['COVERED', 'PICKED_UP'].includes(load.load_status)) {
                topBrokers[brokerName].activeLoads++;
              }
              if (load.load_status === 'DELIVERED') {
                topBrokers[brokerName].completedLoads++;
              }
              const loadPay = parseFloat(load.load_pay || 0);
              topBrokers[brokerName].revenue += loadPay;
              topBrokers[brokerName].averageRate = topBrokers[brokerName].revenue / topBrokers[brokerName].totalLoads;
            }
          });

          setStats({
            loads: { 
              total: loadsData.length, 
              active: loadStatuses.COVERED + loadStatuses.PICKED_UP,
              revenue: revenueMetrics.totalRevenue,
              averageRate: revenueMetrics.averageRatePerMile
            },
            dispatchers: { 
              total: (await ApiService.getData('/dispatcher/')).length, 
              active: (await ApiService.getData('/employee/')).length 
            },
            drivers: { 
              total: driversData.length, 
              active: driverStatuses.ACTIVE,
              efficiency: Object.values(driverPerformance).reduce((sum, driver) => sum + driver.efficiency, 0) / Object.keys(driverPerformance).length
            },
            trucks: { 
              total: trucksData.length, 
              active: trucksData.filter(t => t.status === 'ACTIVE').length,
              utilization: (loadsData.filter(l => l.truck).length / trucksData.length) * 100
            },
            trailers: { 
              total: trailersData.length, 
              active: trailersData.filter(t => t.status === 'ACTIVE').length,
              utilization: (loadsData.filter(l => l.trailer).length / trailersData.length) * 100
            },
            brokers: { 
              total: brokersData.length, 
              active: Object.values(topBrokers).filter(b => b.activeLoads > 0).length,
              topPerformer: Object.values(topBrokers).sort((a, b) => b.revenue - a.revenue)[0]?.name
            }
          });

          // Load status data for pie chart
          setLoadStatusData([
            { name: 'COVERED', value: loadStatuses.COVERED, color: '#10B981' },
            { name: 'DELIVERED', value: loadStatuses.DELIVERED, color: '#6366F1' },
            { name: 'PICKED UP', value: loadStatuses.PICKED_UP, color: '#F59E0B' },
            { name: 'POSTED', value: loadStatuses.POSTED, color: '#3B82F6' },
            { name: 'CANCELLED', value: loadStatuses.CANCELLED, color: '#EF4444' }
          ]);

          // Load trend data
          setLoadTrendData(Object.values(loadTrends).sort((a, b) => 
            new Date(a.date) - new Date(b.date)
          ));

          // Driver performance data
          setDriverPerformanceData(
            Object.values(driverPerformance)
              .sort((a, b) => b.efficiency - a.efficiency)
              .slice(0, 5)
          );

          // Top brokers data
          setTopBrokersData(
            Object.values(topBrokers)
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
          );

          setLoading(false);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  const StatCard = ({ title, total, active, icon, color, onClick }) => (
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
        {total}
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
            {active} ({Math.round((active/total) * 100 || 0)}%)
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={(active/total) * 100 || 0}
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