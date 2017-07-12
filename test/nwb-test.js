import expect from "expect";

describe("Depenency check with nwb", () => {
    it("properly includes mocha framework without declaring above", () => {
        expect("tautology").toEqual("tautology");
    });
});
