import "./style.css"
import { getWeather, getLocation } from "./weather"
import { ICON_MAP } from "./iconMap"

navigator.geolocation.getCurrentPosition(positionSuccess, positionError)

let locationData = {}

function positionSuccess({ coords }) {
	getWeather(
		coords.latitude,
		coords.longitude,
		Intl.DateTimeFormat().resolvedOptions().timeZone
	)
		.then(renderWeather)
		.catch((e) => {
			console.error(e)
			alert("Error getting weather.")
		})

	getLocation(coords.latitude, coords.longitude).then((data) => {
    renderLocation(data)
	})
}

function renderLocation(data){
  document.querySelector("[data-current-location]").textContent = data.address.city && `${data.address.city}, ${data.address.country}`
}

function positionError() {
	alert(
		"There was an error getting your location. Please allow us to use your location and refresh the page."
	)
}

function convertToCelcius(temp) {
	const celciusTemp = ((Number(temp) - 32) * 5) / 9
	return Math.round(celciusTemp)
}

function convertMphToKm(speed) {
	const ONE_MPH_TO_KM = 1.609344
	return (speed * ONE_MPH_TO_KM).toFixed(2)
}

function renderWeather({ current, daily, hourly }) {
	renderCurrentWeather(current)
	renderDailyWeather(daily)
	renderHourlyWeather(hourly)
	document.body.classList.remove("blurred")
}

function setValue(selector, value, { parent = document } = {}) {
	parent.querySelector(`[data-${selector}]`).textContent = value
}

function getIconUrl(iconCode) {
	return `icons/${ICON_MAP.get(iconCode)}.svg`
}

const currentIcon = document.querySelector("[data-current-icon]")
function renderCurrentWeather(current) {
	currentIcon.src = getIconUrl(current.iconCode)
	setValue("current-temp", convertToCelcius(current.currentTemp))
	setValue("current-high", convertToCelcius(current.highTemp))
	setValue("current-low", convertToCelcius(current.lowTemp))
	setValue("current-fl-high", convertToCelcius(current.highFeelsLike))
	setValue("current-fl-low", convertToCelcius(current.lowFeelsLike))
	setValue("current-wind", convertMphToKm(current.windSpeed))
	setValue("current-precip", current.precip)
}

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long" })
const dailySection = document.querySelector("[data-day-section]")
const dayCardTemplate = document.getElementById("day-card-template")
function renderDailyWeather(daily) {
	dailySection.innerHTML = ""
	daily.forEach((day) => {
		const element = dayCardTemplate.content.cloneNode(true)
		setValue("temp", convertToCelcius(day.maxTemp), { parent: element })
		setValue("date", DAY_FORMATTER.format(day.timestamp), { parent: element })
		element.querySelector("[data-icon]").src = getIconUrl(day.iconCode)
		dailySection.append(element)
	})
}

const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: "numeric" })
const hourlySection = document.querySelector("[data-hour-section]")
const hourRowTemplate = document.getElementById("hour-row-template")

function renderHourlyWeather(hourly) {
	hourlySection.innerHTML = ""
	hourly.forEach((hour) => {
		const element = hourRowTemplate.content.cloneNode(true)
		setValue("temp", convertToCelcius(hour.temp), { parent: element })
		setValue("fl-temp", convertToCelcius(hour.feelsLike), { parent: element })
		setValue("wind", convertMphToKm(hour.windSpeed), { parent: element })
		setValue("precip", hour.precip, { parent: element })
		setValue("day", DAY_FORMATTER.format(hour.timestamp), { parent: element })
		setValue("time", HOUR_FORMATTER.format(hour.timestamp), { parent: element })
		element.querySelector("[data-icon]").src = getIconUrl(hour.iconCode)
		hourlySection.append(element)
	})
}
