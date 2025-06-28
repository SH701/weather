import { Fontisto } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const apikey = "72ab1afb9de97bf30384fd74fdef582e";
const icons: Record<string, keyof typeof Fontisto.glyphMap> = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};

export default function Index() {
  const [ok, setOk] = useState(true);
  const [city, setCity] = useState("");
  const [days, setDays] = useState<any[]>([]);

  const ask = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
      return;
    }

    const { coords: { latitude, longitude } } =
      await Location.getCurrentPositionAsync();
    const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
    setCity(geocode.city || "");

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast` +
      `?lat=${latitude}&lon=${longitude}` +
      `&appid=${apikey}&units=metric`
    );
    const json = await response.json();

    const dailyFromList = json.list.filter((_: any, idx: number) => idx % 8 === 7);
    setDays(dailyFromList);
  };

  useEffect(() => {
    ask();
  }, []);

  return (
    <LinearGradient
      colors={['#e55723', '#1688e5']}
      style={styles.container}
      start={[0, 0]}
      end={[1, 1]}
    >
      <View style={styles.city}>
        <Text style={styles.cityName}>
          {ok ? (city || '위치 가져오는 중...') : '권한 거부됨'}
        </Text>
      </View>

      <View style={styles.scrollContainer}>
        <ScrollView
          pagingEnabled
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weather}
        >
          {days.length === 0 ? (
            <View style={[styles.day, styles.loader]}>
              <ActivityIndicator color="white" size="large" />
            </View>
          ) : (
            days.map((day, idx) => {
              const date = new Date(day.dt_txt);
              return (
                <View key={idx} style={styles.day}>
                  <Text style={{...styles.date}}>
                    {`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}
                  </Text>
                  <View style={styles.header}>
                    <Text style={styles.temp}>
                      {parseFloat(day.main.temp).toFixed(1)}°C
                    </Text>
                    <Fontisto
                      name={icons[day.weather[0].main] || 'cloudy'}
                      size={68}
                      color="white"
                    />
                  </View>
                  <Text style={styles.description}>
                    {day.weather[0].main}
                  </Text>
                  <Text style={styles.tinyText}>
                    {day.weather[0].description}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  city: {
    flex: 0.2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  cityName: {
    fontSize: 58,
    fontWeight: '500',
    color: 'white',
  },
  scrollContainer: {
    flex: 0.8,
  },
  weather: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: 'flex-start',
    paddingLeft:43,
    marginBottom:100
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  date: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center',    
    alignSelf: 'center',
    marginBottom: 100,
    marginRight:50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    justifyContent: "space-between",
  },
  temp: {
    fontSize: 60,
    fontWeight: '600',
    color: 'white',
  },
  description: {
    marginTop: -10,
    fontSize: 30,
    color: "white",
    fontWeight: "500",
  },
  tinyText: {
    marginTop: -5,
    fontSize: 25,
    color: "white",
    fontWeight: "500",
  },
});
