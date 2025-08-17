import React from "react";
import { Grid, Segment, Header, Button, Icon } from "semantic-ui-react";


export function Landing() {
    return (
        <div className="landing">
            {/* Header */}
            <Segment textAlign="center">
                <Header as="h1">
                    <Icon name="users" color="blue"/>Family
                </Header>
            </Segment>
            <Grid stackable columns={2}>

                {/* CREATOR */}
                <Grid.Column>
                    <Segment padded="very" textAlign="center">
                        <div>
                            <Icon name="file excel" size="huge" color="green" />
                            <Header as="h2">Create XLS</Header>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 40px)",
                                gap: "4px",
                                justifyContent: "center",
                                margin: "1.5rem 0"
                            }}>
                                {[...Array(15)].map((_, i) => (
                                    <div key={i} style={{
                                        width: "40px",
                                        height: "30px",
                                        border: "1px solid #ccc",
                                        backgroundColor: "#f9f9f9"
                                    }}/>
                                ))}
                            </div>
                        </div>
                        <Button fluid primary style={{ margin: "auto" }}>Create XLS</Button>
                    </Segment>
                </Grid.Column>

                {/* Upload GEDCOM */}
                <Grid.Column>
                    <Segment padded="very" textAlign="center" style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        alignItems: "center"
                    }}>
                        <Icon name="upload" size="huge" color="yellow" />
                        <Header as="h2">Upload GEDCOM</Header>
                        <div className="dropzone">Drop a GEDCOM file here</div>
                    </Segment>
                </Grid.Column>

            </Grid>
        </div>
    );
}
