new Vue({
    el: '#app',
    data() {
        return {
            summary : {
                NewConfirmed : 0,
                TotalConfirmed: 0,
                NewDeaths: 0,
                TotalDeaths: 0,
                NewRecovered: 0,
                TotalRecovered: 0
            },
            countries : [],
            is_online : true,
            is_loading : false,
            host : {
                name : "",
                protocol : "",
                port : ""
            }
        }
    },
    created(){
        window.addEventListener('offline', () => { this.is_online = false })
        window.addEventListener('online', () => { this.is_online = true })
        window.history.pushState({ noBackExitsApp: true }, '')
        window.addEventListener('popstate', this.backPress)
        this.setCurrentHost()
    },
    mounted () {
        window.$('.dropdown-trigger').dropdown()
        window.$('.modal').modal({opacity:0.05,dismissible: false,preventScrolling:false})
        window.$('.sidenav').sidenav()
        this.covidSummary();
    },
    computed : {
        getPageName(){
            let param = new URLSearchParams(window.location.search)
            let name = param.get('page')
            return name ? name : "main-page"
        }
    },
    methods : {
        covidSummary(){
            this.is_loading = true
            axios({
                method: 'get',
                url:  'https://api.covid19api.com/summary'
              }).then(response => {
                    this.is_loading = false
                    if (response.data.status == 404) {
                        window.location = this.baseUrl()
                        return
                    }

                    if (!response.data) {
                        window.location = this.baseUrl()
                        return
                    }

                    this.countries = response.data.Countries;
                    this.summary = {
                        NewConfirmed : response.data.Global.NewConfirmed,
                        TotalConfirmed: response.data.Global.TotalConfirmed,
                        NewDeaths: response.data.Global.NewDeaths,
                        TotalDeaths: response.data.Global.TotalDeaths,
                        NewRecovered: response.data.Global.NewRecovered,
                        TotalRecovered: response.data.Global.TotalRecovered
                    },

                    this.initAnyChart([
                        ['New Confirmed',String(response.data.Global.NewConfirmed)],
                        ['New Recovered',String(response.data.Global.NewRecovered)],
                        ['New Deaths',String(response.data.Global.NewDeaths)],
                        ['Total Confirmed',String(response.data.Global.TotalConfirmed)],
                        ['Total Deaths',String(response.data.Global.TotalDeaths)],
                        ['Total Recovered',String(response.data.Global.TotalRecovered)]
                    ])
                })
                .catch(e => {
                    console.log(e)
                    this.is_loading = false
                })
        },
        initAnyChart(data){

            anychart.onDocumentReady(function() {
                // create column chart
                var chart = anychart.column();

                // turn on chart animation
                chart.animation(true);

                // set chart title text settings
                chart.title('Summary COVID 19');

                // create area series with passed data
                var series = chart.column(data);

                // set series tooltip settings
                series.tooltip().titleFormat('{%X}');

                series
                .tooltip()
                .position('center-top')
                .anchor('center-bottom')
                .offsetX(0)
                .offsetY(5)
                .format('{%Value}{groupsSeparator: }');

                series.normal().fill("#ffbb6d", 0.3);
                series.hovered().fill("#ffbb6d", 0.1);
                series.selected().fill("#ffbb6d", 0.5);
                series.normal().stroke("#ffbb6d", 1, "10 5", "round");
                series.hovered().stroke("#ffbb6d", 2, "10 5", "round");
                series.selected().stroke("#ffbb6d", 4, "10 5", "round");
                // set scale minimum
                chart.yScale().minimum(0);

                // set yAxis labels formatter
                chart.yAxis().labels().format('{%Value}{groupsSeparator: }');

                // tooltips position and interactivity settings
                chart.tooltip().positionMode('point');
                chart.interactivity().hoverMode('by-x');

                // axes titles
                chart.xAxis().title('Description');
                chart.yAxis().title('Total');
                chart.background().fill({'keys':['white']})
                chart.tooltip().background().fill("#ffbb6d");

                // set container id for the chart
                chart.container('container');

                // initiate chart drawing
                chart.draw();
            });
        },
        switchPage(name){
            if ('URLSearchParams' in window) {
                var searchParams = new URLSearchParams(window.location.search);
                searchParams.set('page', name);
                window.location.search = searchParams.toString();
            }
        },
        newPage(name){
            if ('URLSearchParams' in window) {
                var searchParams = new URLSearchParams(window.location.search);
                searchParams.set('page', name);
                window.open("?" + searchParams.toString(), '_blank')
            }
        },
        switchLang(lang){
            if ('URLSearchParams' in window) {
                var searchParams = new URLSearchParams(window.location.search);
                searchParams.set('lang', lang);
                window.location.search = searchParams.toString();
            }
        },
        langCheck(lang){
            let def = "ind"
            let param = new URLSearchParams(window.location.search)
            let name = param.get('lang')
            return name ? (name == lang) : (def == lang)
        },
        backPress(){
            if (event.state && event.state.noBackExitsApp) {
                window.history.pushState({ noBackExitsApp: true }, '')
            }
        },
        setCurrentHost(){
            this.host.name = window.location.hostname
            this.host.port = location.port
            this.host.protocol = location.protocol.concat("//")
        },
        baseUrl(){
            return this.host.protocol.concat(this.host.name + ":" + this.host.port + "/")
        },
        numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }
})

