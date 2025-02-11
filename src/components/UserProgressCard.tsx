import { User, UserPointsHistory } from '@/types';
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface UserProgressCardProps {
  user: User;
  pointsHistory: UserPointsHistory[];
  timeframe: 'daily' | 'weekly' | 'monthly';
}

export default function UserProgressCard({ user, pointsHistory, timeframe }: UserProgressCardProps) {
  const formatDate = (date: Date, format: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    switch (format) {
      case 'MMM dd':
        return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
      case 'MMM yyyy':
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
      default:
        return date.toISOString().split('T')[0];
    }
  };

  const getPeriodStart = (date: Date) => {
    const newDate = new Date(date);
    switch (timeframe) {
      case 'daily':
        return new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      case 'weekly':
        const day = newDate.getDay();
        const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
        newDate.setDate(diff);
        return new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      case 'monthly':
        return new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      default:
        return newDate;
    }
  };

  const processData = () => {
    const grouped = new Map<string, number>();

    pointsHistory.forEach((entry) => {
      const date = new Date(entry.date);
      const periodStart = getPeriodStart(date);
      const key = periodStart.toISOString().split('T')[0];

      grouped.set(key, (grouped.get(key) || 0) + entry.points_added);
    });

    const sortedEntries = Array.from(grouped.entries())
      .map(([key, total]) => ({
        periodStart: new Date(key),
        total
      }))
      .sort((a, b) => a.periodStart.getTime() - b.periodStart.getTime());

    const labels = sortedEntries.map(({ periodStart }) => {
      switch (timeframe) {
        case 'daily':
          return formatDate(periodStart, 'MMM dd');
        case 'weekly':
          const periodEnd = new Date(periodStart);
          periodEnd.setDate(periodStart.getDate() + 6);
          return `${formatDate(periodStart, 'MMM dd')} - ${formatDate(periodEnd, 'MMM dd')}`;
        case 'monthly':
          return formatDate(periodStart, 'MMM yyyy');
        default:
          return '';
      }
    });

    const data = sortedEntries.map(entry => entry.total);

    return { labels, data };
  };

  const { labels, data } = processData();
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <Text style={styles.levelText}>Level {user.level}</Text>
      <Text style={styles.pointsText}>{user.total_points} Points</Text>
      
      {labels.length > 0 ? (
        <LineChart
          data={{
            labels,
            datasets: [{ data }]
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#f8f9fa',
            backgroundGradientTo: '#f8f9fa',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(40, 120, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#2878ff'
            }
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noDataText}>No progress data available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  noDataText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 16,
    paddingVertical: 20,
  },
});