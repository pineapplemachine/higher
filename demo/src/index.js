import React, {Component} from "react";
import {render} from "react-dom";
import styled from "styled-components";

import higher from "../../src/higher";

const UIWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
    background: linear-gradient(20deg, rgb(219, 112, 147), #daa357);
    box-shadow: 0px 2px 20px rgba(0, 0, 0, 0.17);
    box-sizing: border-box;
    font-family: "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    min-height: 100vh;
`;

const Jumbotron = styled.div`
    margin: 2rem 8rem;
`;

const Title = styled.h1`
    font-size: 1.3rem;
    font-weight: 600;
`;

const Description = styled.p`
    font-size: 1.1rem;
    font-weight: 400;
`;

class Demo extends Component{
    constructor(props){
        super(props);
        console.log(higher);
    }

    render(){
        return <Jumbotron>
            <Title>🔥 Higher Demo App 🔥</Title>
            <Description>
                This React component is just a vehicle for easily testing Higher using
                modern ES6-style syntax. Hot-Reloading is enabled, meaning that when you
                modify a file, it will auto-reload right here.
            </Description>
        </Jumbotron>;
    }
}

render(<UIWrapper><Demo/></UIWrapper>, document.querySelector("#demo"));
