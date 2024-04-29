import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { CurrencyModel } from '../models/currency.model';
import { DatePipe } from '@angular/common';

declare const Chart:any;



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  providers: [DatePipe],
  template: `
    <style>
      .selected-coin {
        border-radius: 5px;
        width: 40px;
        color: red;
      }
      .chat-list {
        list-style-type: none;
        padding: 15px;        
      }

      .chat-item {
        margin-bottom: 10px;
      }
    </style>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
    />

    <div class="container">
      <h1 class="text-center text-info m-2">Coin Dünyası</h1>

      @if(!selectedCoin){
      <span>Coin Seçiniz...</span>
      }
      <div class="group-icons mb-4">
        <button class="btn m-1" (click)="selectCoin('Bitcoin')">
          <i
            class="fa-brands fa-bitcoin"
            [ngClass]="{ 'selected-coin': selectedCoin === 'Bitcoin' }"
          ></i>
        </button>
        <button class="btn m-1" (click)="selectCoin('Ethereum')">
          <i
            class="fa-brands fa-ethereum"
            [ngClass]="{ 'selected-coin': selectedCoin === 'Ethereum' }"
          ></i>
        </button>
        <button class="btn m-1" (click)="selectCoin('BNB')">
          <img
            width="25px"
            src="https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png"
          />
        </button>
        <button class="btn m-1" (click)="selectCoin('XRP')">
          <img
            width="25px"
            src="https://s2.coinmarketcap.com/static/img/coins/64x64/52.png"
          />
        </button>
      </div>
      <div class="row">
        <div class="col-md-8">
          <div
            class="d-none "
            id="bitcoinCanvas"
            [class.d-none]="selectedCoin !== 'Bitcoin'"
          >
            <canvas id="bitcoinChart"></canvas>
          </div>
          <div
            class="d-none "
            id="ethereumCanvas"
            [class.d-none]="selectedCoin !== 'Ethereum'"
          >
            <canvas id="ethereumChart"></canvas>
          </div>
          @if(selectedCoin&&!showChat){
      <h2>{{ selectedCoin }}</h2>
      <input type="text" [(ngModel)]="name" placeholder="Adınız..." />
      <button (click)="showChatStart()">Sohbete Başla</button>
      } @if(showChat) {
      <div>
        <h2>{{ selectedCoin }}</h2>

        <div style="float:left;">
          @if(selectedCoin){
          <span>{{ selectedCoin }} Sohbet Odasından </span>
          <button class="btn btn-danger btn-sm" (click)="leave()">Ayrıl</button>

          <p>
            Kullanıcı Adı: <b>{{ name }}</b>
          </p>

          <input [(ngModel)]="message" placeholder="Mesajınız..." />
          <button class="ml-1 btn btn-info btn-sm" (click)="send()">
            Gönder
          </button>
          <hr />

          }
        </div>
      </div>

      }
        </div>
        @if(selectedCoin){
        <div class="col-md-4  ">
          <div>
            <p class="bg-info text-white rounded text-center">
              Sohbetteki kişiler
            </p>
            <ul class="chat-list bg-light ">
              @if(!users || users.length === 0){
              <li class="chat-item">sohbet odası boş</li>
              }@else{ @for(user of users; track user){
              <li class="chat-item bg-secondary bg-gradient  text-white rounded px-4">--> {{ user }}</li>
              }}
            </ul>
          </div>
          <p class="bg-info text-white rounded text-center">Mesajlar</p>
          <ul class="chat-list bg-light">
            @if(!chats || chats.length === 0){
            <li class="chat-item">Sohbet odasında henüz mesaj yok</li>
            }@else{ @for(chat of chats; track chat){
            <li class="chat-item">
            <span class="bg-secondary bg-gradient  text-white rounded px-1"> {{ chat.name }}</span>
              : {{ chat.message }}
            </li>
            }}
          </ul>
        </div>
        }
      </div>


    </div>
  `,
})
export class AppComponent implements AfterViewInit {
  chats: { name: string; message: string }[] = [];
  message: string = '';
  name: string = '';
  users: string[] = [];
  showChat: boolean = false;
  chart: any;
  chartEthereum: any;
  bitcoinCurrencies: CurrencyModel[] = [];
  etheriumCurrencies: CurrencyModel[] = [];

  showChatStart() {
    this.showChat = true;
    this.hub?.invoke('JoinGroup', this.selectedCoin, this.name);
    this.hub?.on('groupUsers', (res: any[]) => {
      this.users = res;
      console.log(this.users);
    });
  }

  selectedCoin: string | null = null;
  selectCoin(coinName: string) {
    this.leave();
    this.selectedCoin = coinName;
    this.startConnection();
    this.chart.update();
    this.chartEthereum.update();
  }
  hub: signalR.HubConnection | undefined;

  constructor(private http: HttpClient, private date: DatePipe) {}

  ngAfterViewInit(): void {}

  send() {
    this.http
      .get(
        `https://localhost:7047/api/Values/SendGroup?groupName=${this.selectedCoin}&name=${this.name}&message=${this.message}`
      )
      .subscribe(() => (this.message = ''));
  }

  startConnection() {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7047/chat-hub')
      .build();

    this.hub
      .start()
      .then(() => {
        console.log('Connection started');
        this.hub?.invoke('ListGroup', this.selectedCoin);
        this.hub?.on('groupUsersList', (res: any[]) => {
          this.users = res;
        });

        this.hub?.invoke('GetGroupMessages', this.selectedCoin);
        this.hub?.on('receiveGroupMessages', (res: any) => {
          console.log(res);
          this.chats = res;
        });

        this.hub?.on('receiveGroup', (res: any) => {
          this.chats.push(res);
          console.log(res);
        });

        this.hub?.on('Currency', (res: CurrencyModel) => {
          if (res.type.value === 1) {
            this.bitcoinCurrencies.push(res);
            if (this.bitcoinCurrencies.length > 15) {
              this.bitcoinCurrencies.shift(); // İlk veriyi sil
            }
          } else {
            this.etheriumCurrencies.push(res);
            if (this.etheriumCurrencies.length > 15) {
              this.etheriumCurrencies.shift(); // İlk veriyi sil
            }
          }

          const labels = this.bitcoinCurrencies.map(
            (val) =>
              this.date.transform(val.createdAt, 'HH:mm:ss') ?? '00:00:00'
          );
          const labels2 = this.etheriumCurrencies.map(
            (val) =>
              this.date.transform(val.createdAt, 'HH:mm:ss') ?? '00:00:00'
          );
          this.chart.data.labels = labels;
          this.chartEthereum.data.labels = labels2;

          const bitcoinData = this.bitcoinCurrencies.map((val) => val.amount);
          const bitcoinHacim = this.bitcoinCurrencies.map(
            (val) => val.amount / 5
          );

          const ethereumData = this.etheriumCurrencies.map((val) => val.amount);
          const ethereumHacim = this.etheriumCurrencies.map(
            (val) => val.amount / 5
          );

          this.chart.data.datasets[0].data = bitcoinData;
          this.chart.data.datasets[1].data = bitcoinHacim;
          this.chartEthereum.data.datasets[0].data = ethereumData;
          this.chartEthereum.data.datasets[1].data = ethereumHacim;
          this.chart.update();
          this.chartEthereum.update();
        });
      })
      .catch((err: any) => console.log(err));
    this.showChart();
  }
  leave() {
    this.hub?.invoke('LeaveGroup', this.selectedCoin);
    this.showChat = false;
  }
  showChart() {
    const ctx = document.getElementById('bitcoinChart');
    const ctxEthereum = document.getElementById('ethereumChart');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: this.selectedCoin,
            data: [],
            borderWidth: 2,
          },
          {
            label: 'Hacim',
            data: [],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
    this.chartEthereum = new Chart(ctxEthereum, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Ethereum',
            data: [],
            borderWidth: 2,
          },
          {
            label: 'Hacim',
            data: [],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}
