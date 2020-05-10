import React from 'react';
import { Button } from 'react-native-elements';
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
import Icon from 'react-native-vector-icons/FontAwesome';
export default class LocalCard extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Animated.View
                style={[
                    styles.address,
                    {
                        opacity: this.props.opacity,
                    }
                ]}
            >
                {this.props.local.name && (
                    <ScrollView style={{ flex: 1 }}>
                        <View style={styles.roundContainer}>
                            <Text style={styles.localTitle}>{this.props.local.name}</Text>

                            {this.props.local.opening_hours && this.props.local.opening_hours.open_now && (
                                <Text style={{ fontSize: 14, marginTop: 2, color: '#00c853' }}> Abierto</Text>
                            )}
                            {this.props.local.opening_hours && !this.props.local.opening_hours.open_now && (
                                <Text style={{ fontSize: 14, marginTop: 2, color: '#f44336' }}> Cerrado</Text>
                            )}

                        </View>
                        <Text style={styles.streetTitle}>{this.props.local.vicinity}</Text>
                        <View style={styles.roundContainer}>
                            <TouchableHighlight
                                activeOpacity={0.6}
                                underlayColor="#ffffff"
                                onPress={() => this.props.changeColor('green')}>
                                <Image source={require('../assets/green.png')} style={this.props.roundStyle('green')} />
                            </TouchableHighlight>
                            <TouchableHighlight
                                activeOpacity={0.6}
                                underlayColor="#ffffff"
                                onPress={() => this.props.changeColor('yellow')}>
                                <Image source={require('../assets/yellow.png')} style={this.props.roundStyle('yellow')} />
                            </TouchableHighlight>
                            <TouchableHighlight
                                activeOpacity={0.6}
                                underlayColor="#ffffff"
                                onPress={() => this.props.changeColor('red')}>
                                <Image source={require('../assets/red.png')} style={this.props.roundStyle('red')} />
                            </TouchableHighlight>
                        </View>
                        <Button
                            containerStyle={styles.buttonContainer}
                            buttonStyle={styles.contribute}
                            onPress={this.props.vote}
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
                            onPress={this.props.Share}
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
        );
    }
}
const styles = StyleSheet.create({
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