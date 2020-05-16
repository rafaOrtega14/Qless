import React, { useRef } from 'react';
import MapView from 'react-native-maps';
import Menu from './components/Menu';
import LocalCard from './components/LocalCard';
import { Marker } from 'react-native-maps';
import { calcCrow } from './helpers/distance';
import Constants from 'expo-constants';
import publicIP from 'react-native-public-ip';
import ActionButton from 'react-native-action-button';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Location from 'expo-location';
import {
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  Text,
  View,
  Dimensions,
  Share,
  Image,
  Animated
} from 'react-native';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    console.disableYellowBox = true;
    this.state = {
      hasError: false,
      showTheThing: false,
      locals: [],
      local: {},
      info: false,
      searchButton: false,
      location: {},
      locationType: 'restaurant',
      times: 0,
      color: '',
      changeRegion: false,
      region: {},
      delta: {},
      opacity: new Animated.Value(0)
    };
  }
  Share = async () => {
    try {
      let message;
      switch (this.state.color) {
        case 'red':
          message = `En ${this.state.local.name} hay muchisima cola, no vengas!`;
          break;
        case 'yellow':
          message = `En ${this.state.local.name} hay algo de cola`;
          break;
        case 'green':
          message = `En ${this.state.local.name} no hay casi cola, aprovecha!`;
          break;
        default:
          message = `No se cuanta cola hay en ${this.state.local.name}`;
      }
      const result = await Share.share({
        message,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  async fetchMarkerData(latitude, longitude, type) {
    try {
      console.log(`https://qless-app.herokuapp.com/${latitude}/${longitude}/${type}`);
      const response = await fetch(`https://qless-app.herokuapp.com/${latitude}/${longitude}/${type}`);
      const responseJson = await response.json();
      return responseJson;
    } catch (e) {
      console.log(e.message)
    }

  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  async componentDidMount() {
    const { status } = await Location.requestPermissionsAsync();
    if (status === 'granted') {
      try {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const locals = await this.fetchMarkerData(location.coords.latitude, location.coords.longitude, this.state.locationType);
        const delta = {
          latitude: 0.01,
          longitude: 0.01
        }
        this.setState({ location: location.coords, delta, locals });
      } catch (e) {
        console.log('Calling https//freegeoip.app/json')
        const responseLoc = await fetch(`https://freegeoip.app/json`);
        const responseJsonLoc = await responseLoc.json();
        const latitude = responseJsonLoc.latitude;
        const longitude = responseJsonLoc.longitude;
        console.log(latitude, longitude)
        const locals = await this.fetchMarkerData(latitude, longitude, this.state.locationType);
        const delta = {
          latitude: 0.01,
          longitude: 0.01
        }
        this.setState({ location: { latitude, longitude }, delta, locals });
      }
    } else {
      console.log({ error: 'Locations services needed' });
    }
  }
  showInfo() {
    if (this.state.showTheThing && this.state.info) {
      this.fadeOut();
      this.setState({ showTheThing: false, local: {}, changeRegion: false })
    } else {
      this.setState({ info: true, showTheThing: true, changeRegion: false })
      this.fadeIn();
    }
  }
  async searchTypes(type) {
    this.setState({ locationType: type, changeRegion: true });
    const locals = await this.fetchMarkerData(this.state.region.latitude, this.state.region.longitude, type);
    this.setState({ locals, location: this.state.region, changeRegion: false });
  }
  markerClick(local) {
    if (this.state.showTheThing && local.name === this.state.local.name) {
      this.fadeOut();
      this.setState({ showTheThing: false, local: {}, changeRegion: false })
    } else {
      const location = {
        latitude: local.geometry.location.lat,
        longitude: local.geometry.location.lng
      }
      this.setState({ info: false, showTheThing: true, local, location, color: local.vote ? local.vote : '', changeRegion: false })
      this.fadeIn();
    }
  }
  changeColor(color) {
    this.setState({ color, changeRegion: false })
  }
  async vote() {
    const body = this.state.local;
    body.vote = this.state.color;
    body.userId = Constants.installationId;
    const rawResponse = await fetch('https://qless-app.herokuapp.com/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const content = await rawResponse.json();
    const locals = await this.fetchMarkerData(this.state.location.latitude, this.state.location.longitude, this.state.locationType);
    this.setState({ locals, changeRegion: false });
  }
  roundStyle(color) {
    const ratio = color === 'yellow' ? 3 : 3.5;
    if (this.state.color === color) {
      return {
        height: (Dimensions.get('window').width / 1.1) / ratio,
        width: (Dimensions.get('window').width / 1.1) / ratio,
        opacity: 1
      }
    } else {
      return {
        height: (Dimensions.get('window').width / 1.1) / ratio,
        width: (Dimensions.get('window').width / 1.1) / ratio,
        opacity: 0.2
      }
    }
  }
  onRegionChange(region) {
    if (this.state.location) {
      const distance = calcCrow(this.state.location.latitude, this.state.location.longitude, region.latitude, region.longitude);
      if (distance > 3 && this.state.times > 5) {
        this.setState({ searchButton: true, location: region, changeRegion: false })
      } else {
        this.setState({ region, times: this.state.times + 1, changeRegion: true });
      }
    }

  }
  async search() {
    const locals = await this.fetchMarkerData(this.state.region.latitude, this.state.region.longitude, this.state.locationType);
    this.setState({ searchButton: false, locals, location: this.state.region, changeRegion: false });
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.changeRegion) {
      return false;
    } else {
      console.log('render')
      return true;
    }
  }
  fadeIn = () => {
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 500
    }).start();
  };
  fadeOut = () => {
    Animated.timing(this.state.opacity, {
      toValue: 0,
      duration: 500
    }).start();
  };


  render() {
    return (
      <View style={styles.container}>
        {this.state.location.latitude && (
          <MapView
            region={{
              latitude: this.state.location.latitude,
              longitude: this.state.location.longitude,
              latitudeDelta: this.state.delta.latitude,
              longitudeDelta: this.state.delta.longitude
            }}
            loadingEnabled={true}
            scrollEnabled={true}
            showsMyLocationButton={true}
            loadingIndicatorColor="#666666"
            loadingBackgroundColor="#eeeeee"
            moveOnMarkerPress={false}
            showsUserLocation={true}
            showsCompass={true}
            showsPointsOfInterest={false}
            provider="google"
            onRegionChange={this.onRegionChange.bind(this)}
            style={styles.mapStyle}
          >

            {this.state.locals.map((local, index) => {
              const latitude = local.geometry.location.lat;
              const longitude = local.geometry.location.lng;
              return (
                <Marker
                  key={index}
                  coordinate={{ latitude, longitude }}
                  onPress={() => this.markerClick(local)}
                >
                  {local.vote && local.vote === 'red' && (
                    <Image source={require('./assets/red.png')} style={{ height: 35, width: 35 }} />
                  )}
                  {local.vote && local.vote === 'yellow' && (
                    <Image source={require('./assets/yellow.png')} style={{ height: 35, width: 35 }} />
                  )}
                  {local.vote && local.vote === 'green' && (
                    <Image source={require('./assets/green.png')} style={{ height: 35, width: 35 }} />
                  )}
                  {!local.vote && (
                    <Image source={require('./assets/question.png')} style={{ height: 35, width: 35 }} />
                  )}
                </Marker>
              );
            })}
          </MapView>
        )}
        <LocalCard
          local={this.state.local}
          opacity={this.state.opacity}
          showTheThing={this.state.showTheThing}
          Share={this.Share.bind(this)}
          roundStyle={this.roundStyle.bind(this)}
          vote={this.vote.bind(this)}
          changeColor={this.changeColor.bind(this)}
          info={this.state.info}
        />
        {this.state.searchButton && (
          <Button
            containerStyle={styles.floatingButton}
            title="Buscar en esta zona"
            onPress={this.search.bind(this)}
          />
        )}
        <Menu
          searchTypes={this.searchTypes.bind(this)}
          showInfo={this.showInfo.bind(this)}
        />
      </View>

    );
  }
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 50
  },
  infoButton: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#ee6e73',
    position: 'absolute',
    top: 280,
    right: 30,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  }
});
