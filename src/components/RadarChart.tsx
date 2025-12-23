import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Polygon,
  Line,
  Circle,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { CategoryScore } from '@/types';
import { CATEGORY_ORDER, getCategoryConfig } from '@/constants/Categories';
import Animated, { FadeIn } from 'react-native-reanimated';

interface RadarChartProps {
  data: CategoryScore[];
  size?: number;
  showLabels?: boolean;
  showPoints?: boolean; // Show XP values on the chart
  animated?: boolean;
  fixedScale?: boolean; // If true, uses fixed 0-100 scale; if false, auto-adjusts to max value
  maxPoints?: number; // Used when fixedScale is true
}

export function RadarChart({
  data,
  size = 280,
  showLabels = true,
  showPoints = false,
  animated = true,
  fixedScale = false,
  maxPoints = 500, // Default max for fixed scale
}: RadarChartProps) {
  // Add padding for labels when shown (more padding if showing points too)
  const labelPadding = showLabels ? (showPoints ? 42 : 32) : 0;
  const effectiveSize = size - labelPadding * 2;
  const center = size / 2;
  const radius = effectiveSize * 0.38; // Main radius for the chart
  const labelRadius = radius + 14; // Labels close to the chart edge
  const levels = 4; // Number of concentric rings

  // Calculate the max value for scaling
  const dataMax = Math.max(...data.map((d) => d.total_points), 1);
  const scaleMax = fixedScale ? maxPoints : dataMax;

  // Map data to ordered categories with normalized values
  const orderedData = CATEGORY_ORDER.map((cat) => {
    const score = data.find((d) => d.category === cat);
    const points = score?.total_points ?? 0;
    // Calculate display percentage based on scale mode
    const displayPercentage = fixedScale
      ? Math.min((points / scaleMax) * 100, 100)
      : (score?.percentage ?? 0);
    return {
      category: cat,
      percentage: displayPercentage,
      total_points: points,
    };
  });

  // Calculate angle for each category (evenly distributed)
  const angleStep = (2 * Math.PI) / CATEGORY_ORDER.length;

  // Calculate point position on the chart
  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2; // Start from top
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Calculate label position (outside the chart)
  const getLabelPosition = (index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    };
  };

  // Generate data polygon points
  const dataPoints = orderedData
    .map((d, i) => {
      const point = getPoint(i, d.percentage);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  // Generate grid polygons for each level
  const gridPolygons = Array.from({ length: levels }, (_, levelIndex) => {
    const levelRadius = ((levelIndex + 1) / levels) * radius;
    const points = CATEGORY_ORDER.map((_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const x = center + levelRadius * Math.cos(angle);
      const y = center + levelRadius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    return points;
  });

  // Generate axis lines
  const axisLines = CATEGORY_ORDER.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x2: center + radius * Math.cos(angle),
      y2: center + radius * Math.sin(angle),
    };
  });

  const Container = animated ? Animated.View : View;

  return (
    <Container
      style={[styles.container, { width: size, height: size }]}
      entering={animated ? FadeIn.duration(600) : undefined}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="dataStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6366F1" stopOpacity="1" />
            <Stop offset="100%" stopColor="#A78BFA" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background grid polygons */}
        {gridPolygons.map((points, i) => (
          <Polygon
            key={`grid-${i}`}
            points={points}
            fill="none"
            stroke="rgba(99, 102, 241, 0.15)"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, i) => (
          <Line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(99, 102, 241, 0.2)"
            strokeWidth={1}
          />
        ))}

        {/* Data polygon with gradient fill */}
        <Polygon
          points={dataPoints}
          fill="url(#dataGradient)"
          stroke="url(#dataStroke)"
          strokeWidth={2.5}
          opacity={0.9}
        />

        {/* Data points (circles at each vertex) */}
        {orderedData.map((d, i) => {
          const point = getPoint(i, d.percentage);
          const config = getCategoryConfig(d.category);
          return (
            <G key={`point-${i}`}>
              {/* Outer glow */}
              <Circle cx={point.x} cy={point.y} r={8} fill={config.color} opacity={0.3} />
              {/* Main point */}
              <Circle
                cx={point.x}
                cy={point.y}
                r={5}
                fill={config.color}
                stroke="#fff"
                strokeWidth={2}
              />
            </G>
          );
        })}

        {/* Labels */}
        {showLabels &&
          orderedData.map((d, i) => {
            const pos = getLabelPosition(i);
            const config = getCategoryConfig(d.category);

            // Adjust text anchor based on position
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (pos.x < center - 10) textAnchor = 'end';
            else if (pos.x > center + 10) textAnchor = 'start';

            // Adjust vertical position
            let dy = 0;
            if (pos.y < center - 10) dy = -5;
            else if (pos.y > center + 10) dy = 12;

            return (
              <G key={`label-${i}`}>
                <SvgText
                  x={pos.x}
                  y={pos.y + dy}
                  fill="#6B7280"
                  fontSize={11}
                  fontWeight="600"
                  textAnchor={textAnchor}
                >
                  {config.shortLabel}
                </SvgText>
                {showPoints && (
                  <SvgText
                    x={pos.x}
                    y={pos.y + dy + 13}
                    fill={config.color}
                    fontSize={10}
                    fontWeight="700"
                    textAnchor={textAnchor}
                  >
                    {d.total_points}
                  </SvgText>
                )}
              </G>
            );
          })}

        {/* Center circle */}
        <Circle cx={center} cy={center} r={3} fill="rgba(99, 102, 241, 0.5)" />
      </Svg>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
