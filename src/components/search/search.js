import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import plur from 'plur';
import SearchCategories from '../searchCategories/searchCategories';
import './searchstyle.scss';
import './tagstyle.scss';

export default class Search extends Component {
    constructor(props) {
        super(props);

        this.activities = [];
        this.adults = null;
        this.children = null;
        this.addItem = this.addItem.bind(this);
        this.state = {
            tags: {},
            adults: 0,
            children: 0
        };
    }

    componentDidMount() {
        this.inputDOMnode = ReactDOM.findDOMNode(this.refs.input);

        this.setState({
            tags: {
                location: {
                    text: 'Norwich'
                }
            }
        });
    }

    handlePress(e) {
        e.preventDefault();
        // var textValue = this.inputDOMnode.value;
        // this.inputDOMnode.placeholder = '';
        // if (e.keyCode === 9) {
        //     this.setState({
        //         tags: this.state.tags.concat([{
        //             type: 'activity',
        //             val: textValue
        //         }])
        //     });
        //     this.inputDOMnode.value = '';
        //     this.inputDOMnode.focus();
        //     this.props.actions.getEvents();
        //
        // }
    }

    createOccupancyTag (item, count) {
        return `${count} ${plur(item.singular, count)}`;
    }

    addItem(type, item) {
        let newItem = {[type]: {
            text: item.text
        }};

        if (type === 'occupancy') {
            newItem = {
                [`${type}-${item.key}`]: {
                    text: this.createOccupancyTag(item, this.state[item.key] + 1),
                    key: item.key,
                    singular: item.singular
                }
            };

            this.setState({
                [item.key]: ++this.state[item.key]
            });
        }

        if (type === 'activity') {
            this.activities = this.activities.concat([{
                text: item
            }]);
            newItem = {'activity': this.activities };
        }

        this.setState({
            tags: Object.assign({}, this.state.tags, newItem)
        });

        this.props.actions.getEvents();
    }

    removeItem(tag, type) {
        let tempState =  Object.assign({}, this.state.tags);
        if (tag === 'activity') {
            let index = this.state.tags.activity.indexOf(type);
            this.activities = this.activities.filter((_, i) => i !== index);
            tempState =  Object.assign({}, this.state.tags, {'activity': this.activities});
        } else if (type.indexOf('occupancy') > -1) {
            this.setState({
                [type]: --this.state[tag.key]
            }, () => {
                if (this.state[tag.key] === 0) {
                    delete tempState[type];
                } else {
                    tempState[type].text = this.createOccupancyTag(tag, this.state[tag.key]);
                }
            });
        } else {
            delete tempState[type];
        }

        this.setState({
            tags: tempState
        });

        this.props.actions.getEvents();
    }

    handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.state.tags.length) {
            this.props.actions.getEvents();
        }
    }

    render() {
        return(
            <header>
                <div className="search">
                    <form>
                        <div className="search__inputwrapper">
                            { Object.keys(this.state.tags).map((tag, i)=> {
                                const tagTypeClass = classNames('tag', 'tag__' + tag);
                                if (tag === 'activity') {
                                    return this.state.tags.activity.map((theActivity, j) => {
                                        return <div className={tagTypeClass} key={j}>{theActivity.text}<span className="tag__cancel" onClick={() => this.removeItem(tag, theActivity)}>&times;</span></div>
                                    })
                                }
                                return <div className={tagTypeClass} key={i}>{this.state.tags[tag].text}<span className="tag__cancel" onClick={() => this.removeItem(this.state.tags[tag], tag)}>&times;</span></div>
                            })}

                            <input type="text" className="search__input" ref="input" onKeyDown={this.handlePress.bind(this)} placeholder="Enter or Select location, date, holiday type and activities"/>
                        </div>
                        <button className="search__button" onClick={(e) => this.handleSubmit(e)}>SEARCH</button>
                    </form>
                </div>
                <SearchCategories addItemCallback={this.addItem}/>
            </header>
        )
    }
}
