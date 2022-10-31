import Twit from "twit";
import dotenv from "dotenv";
import fetch from 'node-fetch';
import nodeSchedule from 'node-schedule';


const endData = new Date(2022, 9, 30, 23, 1)

dotenv.config();

// Autenticação
const Bot = new Twit({
  consumer_key: process.env.API_KEY,
  consumer_secret:process.env.API_SECRET_KEY,
  access_token:process.env.ACCESS_TOKEN,
  access_token_secret:process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:60 * 1000
});

// Pegar dados disponibilizados pelo tse
const getData = async () => {
  let url = 'https://resultados.tse.jus.br/oficial/ele2022/545/dados-simplificados/br/br-c0001-e000545-r.json';
  let results = await fetch(url);
  let json = await results.json();
  if(json) {
    return json;
  } else {
    return null;
  }
}

async function BotInit() {
  let info = await getData();
  
  if(info) {
    // Separar informações úteis
    let votosValidados = info.psi;
    let candidatos = info.cand;
    var tweet = {
      status: `Atualização eleições 2° turno: \n 1-${candidatos[0].nm} - ${candidatos[0].pvap}% - ${formatar(candidatos[0].vap)} votos\n 2-${candidatos[1].nm} - ${candidatos[1].pvap}% - ${formatar(candidatos[1].vap)} votos\n ${votosValidados}% dos votos validados`
    };
    
    // Tweetar
    Bot.post('statuses/update', tweet, tweeted);
    
    function tweeted(error, data, response) {
      if(!error) {
        console.log("Tweet realizado!");
      } else {
        console.log("error:", error);
      }
    }
  } else {
    console.log("Não foi encontrado informações!");
  }
}

const myInterval = setInterval(BotInit, 60*1000);

const shutdown = nodeSchedule.scheduleJob(endData, () => {
  clearInterval(myInterval);
  schedule.gracefulShutdown();
  process.exit(0);
})

function formatar(numStr) {
  let j = 0;
  let newNums = numStr.split('');
  let result = '';
  for(let i = newNums.length-1;i>=0;i--) {
    if(j%3 == 0 && j!=0) {
      result += '.';
    }
    result += newNums[i];
    j++;
  };
  return result.split('').reverse().join('')
}