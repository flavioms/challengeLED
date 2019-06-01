const fs = require('fs');
const csv = require('fast-csv');
const readFile = (file) => {
    return new Promise((resolve, reject) => {
        let result = []
        let stream = fs.createReadStream(file)
        let csvStream = csv({ headers: true })
            .on("data", (data) => { result.push(data) })
            .on("error", (error) => { reject(error) })
            .on("end", () => { resolve(result) })
        stream.pipe(csvStream)
    })
}
const calcSpeed = (dino) => {
    const g = 9.8 ^ 2
    let result = 0
    try {
        result = ((dino.STRIDE_LENGTH / dino.LEG_LENGTH) - 1) * Math.sqrt(dino.LEG_LENGTH * g)
        result = parseFloat(result.toFixed(2))
    } catch (error) {
        throw error
    }
    return result
}
async function main() {
    let dinosAdditionals, dinosStatistics, allDinos = []
    try {
        dinosStatistics = await readFile('dataset1.csv')
            .then(result => { return result })
            .catch(error => { throw error })
        dinosAdditionals = await readFile('dataset2.csv')
            .then(result => { return result })
            .catch(error => { throw error })

        allDinos = dinosStatistics.map((dinoS) => {
            let filtrado = dinosAdditionals.filter(dinoA => dinoA.NAME === dinoS.NAME)
            let dinoFull = Object.assign(...filtrado, dinoS)
            return { ...dinoFull, SPEED: calcSpeed(dinoFull) }
        })
            .filter(dino => dino.STANCE == 'bipedal')
            .sort(function (a, b) {
                if (a.SPEED > b.SPEED) return -1;
                if (a.SPEED < b.SPEED) return 1;
                return 0;
            })
        fs.writeFile("./output.txt", JSON.stringify(allDinos, null, 2), (error) => console.log(error))
    } catch (error) {
        console.log('Error: ', error)
    }
}
main()

// TDD utilizando Jasmine
//
// async function test() {
//     describe("Dinossauros", function () {
//         it("Validar o carregamento de arquivos", async () => {
//             let lista = await readFile('dataset1.csv')
//             expect(lista.length > 0);
//         });
//         it("Valicar calculo de velocidade", async () => {
//             let speed = calcSpeed({ STRIDE_LENGTH: 1.4, LEG_LENGTH: 0.9 })
//             expect(1.75).toBe(speed);
//         });
//     });
// }

// test()