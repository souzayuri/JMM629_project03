// Array of names from your CSV file
const names = [
  "Paulete", "Chuchu", "Patricia", "Jamesbond", "Georgete", "Esperta", "Chico", 
  "Tonha", "Tina", "Mama", "Lou", "Titi", "Colombina", "Pana", "Elis", "Zaca", 
  "Suli", "Kuruka", "Arno", "Zemaria", "Zefa", "Carabi", "Segre", "Donalina", 
  "Ziggy", "Anna", "Donacida", "Bandaid", "Kelly", "Benjamin", "Soniamadalena", 
  "Vivek", "Luis", "Felippe", "Rita", "Morena", "Dora", "Nic", "Sergiao", "Sy", 
  "Caio", "Emilio", "Rick", "Leslie", "Sachin", "Duda", "Karin", "Nelsao", 
  "Jordano", "Gabriela", "Carijo", "Michele", "Cassandra", "Malu", "Moreninho", 
  "Ted", "Wally", "Mucci", "Wie", "Paulona", "Liana", "Popeye", "Doinho", 
  "Pretinho", "Columbus", "Valentina", "Carminha", "Farofo", "Angelina", 
  "Sidney", "Lauro", "Donna", "Cuzinho"
];

// Function to select a random name from the array
function getRandomName() {
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}

// Function to replace the X with a random name
function replaceName() {
  const randomNameElement = document.getElementById('random-name');
  if (randomNameElement) {
    randomNameElement.textContent = getRandomName();
  }
}

// Replace the name when the page loads
document.addEventListener('DOMContentLoaded', replaceName);

// Optional: Add this function if you want to allow users to get a new random name
function refreshRandomName() {
  replaceName();
}