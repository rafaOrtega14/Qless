import React, { useRef } from 'react';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { Button } from 'react-native-elements';
import * as Location from 'expo-location';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome';
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
    this.state = {
      hasError: false,
      showTheThing: false,
      locals: [],
      local: {},
      searchButton: false,
      location: {},
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

      const result = await Share.share({
        message: 'React Native | A framework for building native apps using React',
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  async fetchMarkerData(latitude, longitude) {
    try {
      console.log(`http://192.168.0.17:3000/${latitude}/${longitude}`);
      const response = await fetch(`http://192.168.0.17:3000/${latitude}/${longitude}`);
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
      const location = await Location.getCurrentPositionAsync({});
      const locals = await this.fetchMarkerData(location.coords.latitude, location.coords.longitude);
      const delta = {
        latitude: 0.01,
        longitude: 0.01
      }
      this.setState({ location: location.coords, delta, locals });
    } else {
      console.log({ error: 'Locations services needed' });
    }
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
      this.setState({ showTheThing: true, local, location, color: local.vote ? local.vote : '', changeRegion: false })
      this.fadeIn();

    }
  }
  async vote() {
    const body = this.state.local;
    body.vote = this.state.color;
    const rawResponse = await fetch('http://192.168.0.17:3000/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const content = await rawResponse.json();
    console.log(content);
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
      const distance = this.calcCrow(this.state.location.latitude, this.state.location.longitude, region.latitude, region.longitude);
      if (distance > 3 && this.state.times > 5) {
        this.setState({ searchButton: true, location: region, changeRegion: false })
      } else {
        this.setState({ region, times: this.state.times + 1, changeRegion: true });
      }
    }

  }
  async search() {
    const locals = await this.fetchMarkerData(this.state.region.latitude, this.state.region.longitude);
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
  calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = this.toRad(lat2 - lat1);
    var dLon = this.toRad(lon2 - lon1);
    var lat1 = this.toRad(lat1);
    var lat2 = this.toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }
  toRad(Value) {
    return Value * Math.PI / 180;
  }

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
        {this.state.searchButton && (
          <Button
            containerStyle={styles.floatingButton}
            title="Buscar en esta zona"
            onPress={this.search.bind(this)}
          />
        )}

        <Animated.View
          style={[
            styles.address,
            {
              opacity: this.state.opacity,
            }
          ]}
        >
          {this.state.local.name && (
            <ScrollView style={{ flex: 1 }}>
              <View style={styles.roundContainer}>
                <Text style={styles.localTitle}>{this.state.local.name}</Text>

                {this.state.local.opening_hours && this.state.local.opening_hours.open_now && (
                  <Text style={{ fontSize: 14, marginTop: 2, color: '#00c853' }}> Abierto</Text>
                )}
                {this.state.local.opening_hours && !this.state.local.opening_hours.open_now && (
                  <Text style={{ fontSize: 14, marginTop: 2, color: '#f44336' }}> Cerrado</Text>
                )}

              </View>
              <Text style={styles.streetTitle}>{this.state.local.vicinity}</Text>
              <View style={styles.roundContainer}>
                <TouchableHighlight
                  activeOpacity={0.6}
                  underlayColor="#ffffff"
                  onPress={() => this.setState({ color: 'green', changeRegion: false })}>
                  <Image source={require('./assets/green.png')} style={this.roundStyle('green')} />
                </TouchableHighlight>
                <TouchableHighlight
                  activeOpacity={0.6}
                  underlayColor="#ffffff"
                  onPress={() => this.setState({ color: 'yellow', changeRegion: false })}>
                  <Image source={require('./assets/yellow.png')} style={this.roundStyle('yellow')} />
                </TouchableHighlight>
                <TouchableHighlight
                  activeOpacity={0.6}
                  underlayColor="#ffffff"
                  onPress={() => this.setState({ color: 'red', changeRegion: false })}>
                  <Image source={require('./assets/red.png')} style={this.roundStyle('red')} />
                </TouchableHighlight>
              </View>
              <Button
                containerStyle={styles.buttonContainer}
                buttonStyle={styles.contribute}
                onPress={this.vote.bind(this)}
                title="CONTRIBUTE"
                iconRight={true}
                icon={
                  <Icon
                    style={{ marginLeft: 10, }}
                    name="check-circle"
                    size={20}
                    color="white"
                  />
                }
              />
              <Button
                containerStyle={styles.buttonContainer}
                buttonStyle={styles.shareButton}
                title="SHARE"
                onPress={this.Share}
                iconRight={true}
                icon={
                  <Icon
                    style={{ marginLeft: 10, }}
                    name="share-alt"
                    size={20}
                    color="white"
                  />
                }
              />
            </ScrollView>
          )}
        </Animated.View>
        <ActionButton
          offsetY={300}
          offsetx={10}
          renderIcon={(active) => (active ? <Icon
            name="times"
            size={24}
            color="white"
          /> : <Icon
              name="search"
              size={24}
              color="white"
            />)}
          buttonColor="rgba(231,76,60,1)">
          <ActionButton.Item buttonColor='#9b59b6' title="Supermercados" onPress={() => console.log("notes tapped!")}>
            <Icon
              name="shopping-cart"
              size={24}
              color="white"
            />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#3498db' title="Restaurantes" onPress={() => { }}>
            <Icon
              name="beer"
              size={24}
              color="white"
            />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#1abc9c' title="Farmarcias" onPress={() => { }}>
            <Icon
              name="flask"
              size={24}
              color="white"
            />
          </ActionButton.Item>
        </ActionButton>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 50
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  localImage: {
    width: Dimensions.get('window').width / 1.1,
    height: 200,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  shareButton: {
    width: Dimensions.get('window').width / 1.2,
  },
  contribute: {
    width: Dimensions.get('window').width / 1.2,
    backgroundColor: '#00c853'
  },
  streetTitle: {
    alignItems: 'center',
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: 5,
    fontSize: 16
  },
  localTitle: {
    alignItems: 'center',
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: 2,
    fontSize: 16
  },
  roundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },
  round: {
    height: (Dimensions.get('window').width / 1.1) / 3,
    width: (Dimensions.get('window').width / 1.1) / 3,
    zIndex: -1
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  address: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    width: Dimensions.get('window').width / 1.1,
    height: Dimensions.get('window').height / 2.5,
  }
});
