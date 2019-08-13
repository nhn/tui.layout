### Load dependency files
* Script - [tui-code-snippet](https://github.com/nhn/tui.code-snippet) 1.5.0 or later
* Script - [tui-dom](https://github.com/nhn/tui.dom) 3.0.0 or later
    > If your project should support IE8, please use `tui-dom.js`, not `tui-dom.min.js`.

```html
...
<script type="text/javascript" src="tui-code-snippet.js"></script>
<script type="text/javascript" src="tui-dom.js"></script>
<script type="text/javascript" src="tui-layout.js"></script>
...
```

### HTML structure
```javascript
<!-- lifeStyle section -->
<div id="lifeStyle">
    <div>life Style</div>
</div>

<!-- weahter section -->
<div id="weather">
    <div class="sunny">Clean</div>
    <div>
        <span>Humid : <em>30%</em></span>
        <strong>Wind</strong>
    </div>
</div>

<!-- todolist section -->
<div id="todoList">
    <ul>
        <li><input type="checkbox" /> Breakfast</li>
        <li><input type="checkbox" /> Lunch</li>
        <li><input type="checkbox" /> Dinner</li>
    </ul>
</div>

<!-- today news section -->
<div id="news">
    <ul>
        <li><a href="#">News1</a></li>
        <li><a href="#">News2</a></li>
        <li><a href="#">News3</a></li>
    </ul>
    <a href="#">more</a>
</div>

<!-- layout component root -->
<div id="layout"></div>
```

Make html structure. Each layout item have to have ID.

### Apply layout component

#### Each group and child item options.

* Group

| Name | Description |
| ---- | ---- |
| id | The group ID |
| ratio | Group ratio |
| items | The items that group include |

* Item

| Name | Description |
| ---- | ---- |
| id | The item ID |
| contentId | The content ID |
| title | The layout item title |
| isClose | Whether the item close defualt |
| isDraggable | Whether the item draggable |


```javascript
var layout = new tui.Layout($('#layout'), {
    grouplist: [
        {
            id: 'g1',
            ratio: '50',
            items: [{
                id : 'item-lifeStyle',
                contentId: 'lifeStyle',
                title: "Life Style Seciton",
                isClose: false,
                isDraggable: true
              },
              {
                  id : 'item-todoList',
                  contentId: 'todoList',
                  title: "TodoList Seciton",
                  isClose: false,
                  isDraggable: true
              }
            ]
        },
        {
            id: 'g2',
            ratio: '50',
            items: [{
                id : 'item-weather',
                contentId: 'weather',
                title: "Weather Seciton",
                isClose: false,
                isDraggable: true
            },
            {
                id : 'item-news',
                contentId: 'news',
                title: "News Seciton",
                isClose: true,
                isDraggable: true
            }
          ]
        }
    ]
  }
);
```


### You have to know before apply layout component

* The contents have to have ID.
* The `{{}}` must exist in template.

```html
var HTML = {
    MOVEBUTTON: '<button class="move-button drag-item-move" data-item="{{item-id}}">move</button>',
    ELEMENT: '<div class="item" data-index="{{number}}"><div class="{{wrapper}}"></div></div>',
    TITLE: '<div class="title"></div>',
    TOGGLEBUTTON: '<button class="toggle-button">toggle</button>',
    GROUP : '<div class="group gp_{{group-id}}" data-group="{{group-id}}"></div>',
    GUIDE: '<div class="item-guide"></div>'
};
```
