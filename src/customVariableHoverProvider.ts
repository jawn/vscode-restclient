'use strict';

import { HoverProvider, Hover, MarkedString, TextDocument, CancellationToken, Position } from 'vscode';
import { EnvironmentController } from './controllers/environmentController';
import { VariableProcessor } from './variableProcessor';
import { VariableUtility } from './variableUtility';

export class CustomVariableHoverProvider implements HoverProvider {

    public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {
        if (!VariableUtility.isVariableReference(document, position)) {
            return;
        }

        let wordRange = document.getWordRangeAtPosition(position);
        let selectedVariableName = document.getText(wordRange);

        let fileCustomVariables = VariableProcessor.getCustomVariablesInCurrentFile();
        for (let [variableName, variableValue] of fileCustomVariables) {
            if (variableName === selectedVariableName) {
                let contents: MarkedString[] = [variableValue, { language: 'http', value: `File Variable ${variableName}` }];
                return new Hover(contents, wordRange);
            }
        }

        let environmentCustomVariables = await EnvironmentController.getCustomVariables();
        for (let variableName in environmentCustomVariables) {
            if (variableName === selectedVariableName) {
                let contents: MarkedString[] = [environmentCustomVariables[variableName], { language: 'http', value: `Environment Variable ${variableName}` }];
                return new Hover(contents, wordRange);
            }
        }

        return;
    }
}