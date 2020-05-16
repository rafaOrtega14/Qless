import React from 'react';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome';
export default class Menu extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ActionButton
        offsetY={300}
        offsetx={10}
        renderIcon={(active) => (active ? <Icon
          name="times"
          size={30}
          color="white"
        /> : <Icon
            name="ellipsis-v"
            size={30}
            color="white"
          />)}
        buttonColor="rgba(231,76,60,1)">
        <ActionButton.Item
          buttonColor='#9b59b6'
          title="Supermercados"
          onPress={() => this.props.searchTypes('supermarket')}
        >
          <Icon
            name="shopping-cart"
            size={24}
            color="white"
          />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor='#ff5722'
          title="Información"
          onPress={this.props.showInfo}
        >
          <Icon
            name="info"
            size={24}
            color="white"
          />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor='#3498db'
          title="Restaurantes"
          onPress={() => this.props.searchTypes('restaurant')}>
          <Icon
            name="beer"
            size={24}
            color="white"
          />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor='#1abc9c'
          title="Farmarcias"
          onPress={() => this.props.searchTypes('pharmacy')}>
          <Icon
            name="flask"
            size={24}
            color="white"
          />
        </ActionButton.Item>
      </ActionButton>
    )
  }
}
