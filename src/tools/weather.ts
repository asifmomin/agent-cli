export const getCurrentWeather = async ()=>{
    let weather = {
        temperature:"18",
        unit:"C",
        forecast:"Sunny"
    };
    return JSON.stringify(weather)
}
