import React, { useEffect, useRef } from 'react';
import {
  Animated, Easing, Image, StyleSheet,
  Text, View, Dimensions,
} from 'react-native';

interface Props {
  isLoading: boolean;
  onDone: () => void;
}

const BG     = '#F2EFE8';
const ACCENT = '#0E5C3F';
const W      = Dimensions.get('window').width;
const MIN_MS = 1800;

// Waveform bar heights (px), centered peak
const BAR_H   = [5, 9, 15, 22, 30, 34, 30, 22, 15, 9, 5];
const CYCLE   = 1320; // ms — total wave cycle
const STEP    = 60;   // ms — stagger between bars

const logo = require('../../assets/images/logo.png');

export const AppSplash: React.FC<Props> = ({ isLoading, onDone }) => {
  const logoScale    = useRef(new Animated.Value(0.82)).current;
  const contentAlpha = useRef(new Animated.Value(0)).current;
  const screenAlpha  = useRef(new Animated.Value(1)).current;
  const progress     = useRef(new Animated.Value(0)).current;
  const barAnims     = useRef(BAR_H.map(() => new Animated.Value(0.2))).current;
  const waveLoop     = useRef<Animated.CompositeAnimation | null>(null);

  const minPassed = useRef(false);
  const loadDone  = useRef(false);
  const exiting   = useRef(false);

  const runExit = () => {
    if (exiting.current) return;
    exiting.current = true;
    waveLoop.current?.stop();
    Animated.parallel([
      Animated.timing(progress, { toValue: 1, duration: 220, useNativeDriver: false }),
      Animated.timing(screenAlpha, { toValue: 0, duration: 360, delay: 200, useNativeDriver: true }),
    ]).start(onDone);
  };

  const checkExit = () => { if (minPassed.current && loadDone.current) runExit(); };

  useEffect(() => {
    // Entry: logo springs in + content fades
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, damping: 14, stiffness: 130, useNativeDriver: true }),
      Animated.timing(contentAlpha, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      // Waveform: each bar i lights up with delay = i * STEP, full cycle = CYCLE
      const loop = Animated.parallel(
        barAnims.map((anim, i) =>
          Animated.loop(
            Animated.sequence([
              Animated.delay(i * STEP),
              Animated.timing(anim, { toValue: 1,   duration: 280, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
              Animated.timing(anim, { toValue: 0.2, duration: 280, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
              Animated.delay(CYCLE - 560 - i * STEP),
            ])
          )
        )
      );
      waveLoop.current = loop;
      loop.start();
    });

    // Progress bar fills to 88% over MIN_MS
    Animated.timing(progress, {
      toValue: 0.88,
      duration: MIN_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => { minPassed.current = true; checkExit(); }, MIN_MS);
    return () => { clearTimeout(timer); waveLoop.current?.stop(); };
  }, []);

  useEffect(() => {
    if (!isLoading) { loadDone.current = true; checkExit(); }
  }, [isLoading]);

  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [0, W * 0.46] });

  return (
    <Animated.View style={[s.root, { opacity: screenAlpha }]}>

      {/* ── Top spacer ── */}
      <View style={{ flex: 1.6 }} />

      {/* ── Logo in white circle ── */}
      <Animated.View style={[s.circle, { transform: [{ scale: logoScale }], opacity: contentAlpha }]}>
        <Image source={logo} style={s.logo} resizeMode="contain" />
      </Animated.View>

      {/* ── Tagline ── */}
      <Animated.Text style={[s.tagline, { opacity: contentAlpha }]}>
        {'Tu negocio, contigo. '}
        <Text style={s.taglineAccent}>Siempre creciendo.</Text>
      </Animated.Text>

      {/* ── Middle spacer ── */}
      <View style={{ flex: 0.9 }} />

      {/* ── Waveform bars ── */}
      <Animated.View style={[s.barsRow, { opacity: contentAlpha }]}>
        {barAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[s.bar, { height: BAR_H[i], opacity: anim }]}
          />
        ))}
      </Animated.View>

      {/* ── Progress bar ── */}
      <Animated.View style={[s.progressTrack, { opacity: contentAlpha }]}>
        <Animated.View style={[s.progressFill, { width: progressWidth }]} />
      </Animated.View>

      {/* ── Footer ── */}
      <Animated.View style={[s.footer, { opacity: contentAlpha }]}>
        <Text style={s.footerLine}>Hecho en México</Text>
        <Text style={s.footerVersion}>v1.0.0</Text>
      </Animated.View>

      <View style={{ height: 52 }} />
    </Animated.View>
  );
};

const s = StyleSheet.create({
  root: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: BG,
    alignItems: 'center',
  },

  circle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 6,
  },
  logo: {
    width: 155,
    height: 155,
  },

  tagline: {
    marginTop: 24,
    fontSize: 14.5,
    color: '#5C5C5C',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  taglineAccent: {
    color: ACCENT,
    fontStyle: 'italic',
    fontWeight: '600',
  },

  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: ACCENT,
  },

  progressTrack: {
    marginTop: 18,
    width: W * 0.46,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(14,92,63,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: ACCENT,
  },

  footer: {
    marginTop: 22,
    alignItems: 'center',
    gap: 2,
  },
  footerLine: {
    fontSize: 11,
    color: '#9A9A9A',
    letterSpacing: 0.3,
  },
  footerVersion: {
    fontSize: 10,
    color: '#B5B5B5',
    letterSpacing: 0.2,
  },
});
