import { View } from "react-native";

type ContainerProps = {
    children: React.ReactNode;
    padding?: boolean;
    style?: object;
};

export default function Container({ children, padding = true, style = {} }: ContainerProps) {
    return (
        <View
            className={`flex-1 justify-center items-center ${padding ? "px-4" : ""}`}
            style={style}
        >
            {children}
        </View>
    );
}