import React from "react";
import { Grid, Segment, Header, Button, Icon } from "semantic-ui-react";


export function Landing() {
    return (
        <div style={{ padding: "2rem", backgroundColor: "white", minHeight: "90vh" }}>
            {/* HEADER */}
            <Segment raised textAlign="center" style={{ backgroundColor: "white" }}>
                <Header as="h1">
                    <Icon name="users" color="blue"/>Family
                </Header>
            </Segment>
            <Grid stackable columns={2} style={{ marginTop: "2rem" }}>

                {/* CREATOR */}
                <Grid.Column>
                    <Segment padded="very" textAlign="center" style={{ backgroundColor: "white" }}>
                        <Icon name="file excel" size="huge" color="green" />
                        <Header as="h2" style={{ marginTop: "1rem" }}>Create XLS</Header>

                        {/* Fake grid to represent spreadsheet */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 40px)",
                                gap: "4px",
                                justifyContent: "center",
                                margin: "1.5rem 0"
                            }}
                        >
                            {[...Array(15)].map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: "40px",
                                        height: "30px",
                                        border: "1px solid #ccc",
                                        backgroundColor: "#f9f9f9"
                                    }}
                                />
                            ))}
                        </div>

                        <Button primary>Create XLS</Button>
                    </Segment>
                </Grid.Column>

                {/* Upload GEDCOM */}
                <Grid.Column>
                    <Segment padded="very" textAlign="center" style={{ backgroundColor: "white" }}>
                        <Icon name="upload" size="huge" color="yellow" />
                        <Header as="h2" style={{ marginTop: "1rem" }}>Upload GEDCOM</Header>

                        <div
                            style={{
                                border: "2px dashed #ccc",
                                borderRadius: "8px",
                                padding: "2rem",
                                color: "#777",
                                marginTop: "1.5rem"
                            }}
                        >
                            Drop a GEDCOM file here
                        </div>
                    </Segment>
                </Grid.Column>

            </Grid>
        </div>
    );
}
