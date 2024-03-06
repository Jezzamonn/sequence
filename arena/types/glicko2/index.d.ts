declare module 'glicko2' {
    interface PlayerOptions {
        rating?: number;
        rd?: number;
        vol?: number;
        tau?: number;
        id?: number;
    }

    class Player {
        private _tau: number;
        defaultRating: number;
        volatility_algorithm: (v: number, delta: number) => number;
        __rating: number;
        __rd: number;
        __vol: number;
        id: number;
        adv_ranks: number[];
        adv_rds: number[];
        outcomes: number[];

        constructor(
            rating?: number,
            rd?: number,
            vol?: number,
            tau?: number,
            defaultRating?: number,
            volatilityAlgorithm?: (v: number, delta: number) => number,
            id?: number
        );

        getRating(): number;
        setRating(rating: number): void;
        getRd(): number;
        setRd(rd: number): void;
        getVol(): number;
        setVol(vol: number): void;
        addResult(opponent: Player, outcome: number): void;
        hasPlayed(): boolean;
        _preRatingRD(): void;
        _variance(): number;
        _E(p2rating: number, p2RD: number): number;
        predict(p2: Player): number;
        _g(RD: number): number;
        _delta(v: number): number;
        _makef(delta: number, v: number, a: number): (x: number) => number;
    }

    interface Glicko2Options {
        tau?: number;
        rating?: number;
        rd?: number;
        vol?: number;
        volatility_algorithm?: string;
    }

    class Glicko2 {
        private _tau: number;
        private _default_rating: number;
        private _default_rd: number;
        private _default_vol: number;
        private _volatility_algorithm: (v: number, delta: number) => number;
        players: Player[];
        players_index: number;

        constructor(settings?: Glicko2Options);

        makeRace(results: any[][]): Race;
        removePlayers(): void;
        getPlayers(): Player[];
        cleanPreviousMatches(): void;
        calculatePlayersRatings(): void;
        addMatch(
            player1: PlayerOptions,
            player2: PlayerOptions,
            outcome: number
        ): { pl1: Player; pl2: Player };
        makePlayer(rating?: number, rd?: number, vol?: number): Player;
        _createInternalPlayer(
            rating: number,
            rd: number,
            vol: number,
            id?: number
        ): Player;
        addResult(player1: Player, player2: Player, outcome: number): void;
        updateRatings(matches?: Race | any[][]): void;
        predict(player1: Player, player2: Player): number;
    }

    interface Race {
        matches: number[][];

        getMatches(): number[][];
    }

    const volatility_algorithms: {
        [key: string]: (v: number, delta: number) => number;
    };
}
