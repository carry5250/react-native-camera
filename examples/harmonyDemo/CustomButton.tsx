import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedbackProps, View} from 'react-native';

// 定义按钮组件的属性类型
interface CustomButtonProps extends TouchableWithoutFeedbackProps {
  title: string;
}

// 自定义按钮组件
const CustomButton: React.FC<CustomButtonProps> = ({title, ...rest}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isPressed ? styles.pressedButton : styles.unpressedButton,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...rest}>
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  button: {
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white',
  },
  unpressedButton: {
    backgroundColor: 'transparent',
  },
  pressedButton: {
    backgroundColor: 'blue',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomButton;
