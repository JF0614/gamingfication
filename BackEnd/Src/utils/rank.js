const getRank = (xp) => {
    if (xp >= 1500) return 6;
    if (xp >= 1000) return 5;
    if (xp >= 700) return 4;
    if (xp >= 450) return 3;
    if (xp >= 250) return 2;
    if (xp >= 100) return 1;

    return 0;
};

module.exports = {
    getRank
};